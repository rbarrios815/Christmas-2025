/***************
 * Christmas 2025 Web App
 * Google Sheet backend + JSON endpoint for the GitHub Pages preview.
 ***************/

const SHEET_ID = '1U8foSVSKKCykTFv9fz7nvldVZoYq0aY_n6Yeo1z7Pr0';
const SHEET_NAME = 'Christmas 2025 Sheet 1';
const FIRST_DATA_ROW = 2;

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Christmas 2025 Sign-Up')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function doPost(e) {
  try {
    var body = parseJsonBody_(e);
    var action = body && body.action ? String(body.action) : '';
    var payload = body && body.payload ? body.payload : {};

    if (action === 'getChristmasData') {
      return jsonOut_({ ok: true, data: getChristmasData() });
    }

    if (action === 'saveAttendee') {
      return jsonOut_({ ok: true, data: saveAttendee(payload) });
    }

    return jsonOut_({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut_({
      ok: false,
      error: String(err && err.message ? err.message : err)
    });
  }
}

function getChristmasData() {
  var sheet = getChristmasSheet_();
  var lastRow = Math.max(sheet.getLastRow(), FIRST_DATA_ROW - 1);
  var attendees = [];
  var menu = [];

  if (lastRow >= FIRST_DATA_ROW) {
    var rows = sheet
      .getRange(FIRST_DATA_ROW, 1, lastRow - FIRST_DATA_ROW + 1, 11)
      .getValues();

    rows.forEach(function(row, index) {
      var fullName = cleanName_(row[0]);
      var menuItem = cleanText_(row[9], 120);

      if (menuItem && menu.indexOf(menuItem) === -1) {
        menu.push(menuItem);
      }

      if (!fullName) return;

      attendees.push({
        row: FIRST_DATA_ROW + index,
        fullName: fullName,
        shortName: toShortName_(fullName),
        ageGroup: normalizeAgeGroup_(row[1]),
        food: normalizeFoods_(row[2]),
        enteredBy: cleanName_(row[10]) || fullName
      });
    });
  }

  return {
    meta: {
      time: safeGetDisplayValue_(sheet, 'F2'),
      date: safeGetDisplayValue_(sheet, 'G2'),
      address: safeGetDisplayValue_(sheet, 'H2'),
      questions: safeGetDisplayValue_(sheet, 'I2')
    },
    attendees: attendees,
    menu: menu
  };
}

/**
 * Creates or updates one attendee.
 *
 * Rows are matched by both full name and "Entered By". This prevents two
 * different family groups with the same guest name from overwriting each other.
 */
function saveAttendee(att) {
  if (!att) {
    throw new Error('Missing attendee details.');
  }

  var fullName = cleanName_(att.fullName);
  if (!fullName) {
    throw new Error('Full name is required.');
  }
  if (fullName.length > 120) {
    throw new Error('Full name is too long.');
  }

  var enteredBy = cleanName_(att.enteredBy) || fullName;
  if (enteredBy.length > 120) {
    throw new Error('Entered By name is too long.');
  }

  var ageGroup = normalizeAgeGroup_(att.ageGroup);
  var food = normalizeFoods_(att.food);
  var lock = LockService.getScriptLock();

  lock.waitLock(10000);
  try {
    var sheet = getChristmasSheet_();
    var lastRow = Math.max(sheet.getLastRow(), FIRST_DATA_ROW - 1);
    var rowCount = lastRow >= FIRST_DATA_ROW ? lastRow - FIRST_DATA_ROW + 1 : 0;
    var rows = rowCount
      ? sheet.getRange(FIRST_DATA_ROW, 1, rowCount, 11).getValues()
      : [];

    var targetNameKey = normalizeKey_(fullName);
    var targetEnteredByKey = normalizeKey_(enteredBy);
    var row = resolveSafeRow_(
      att.row,
      rows,
      targetNameKey,
      targetEnteredByKey
    );

    if (!row) {
      for (var i = 0; i < rows.length; i++) {
        var existingName = cleanName_(rows[i][0]);
        if (!existingName) continue;

        var existingEnteredBy = cleanName_(rows[i][10]) || existingName;
        if (
          normalizeKey_(existingName) === targetNameKey &&
          normalizeKey_(existingEnteredBy) === targetEnteredByKey
        ) {
          row = FIRST_DATA_ROW + i;
          break;
        }
      }
    }

    if (!row) {
      row = Math.max(lastRow + 1, FIRST_DATA_ROW);
    }

    sheet.getRange(row, 1, 1, 3).setValues([[
      fullName,
      ageGroup,
      food
    ]]);

    var enteredByCell = sheet.getRange(row, 11);
    if (!cleanName_(enteredByCell.getValue())) {
      enteredByCell.setValue(enteredBy);
    }

    SpreadsheetApp.flush();
    return getChristmasData();
  } finally {
    lock.releaseLock();
  }
}

function resolveSafeRow_(candidate, rows, targetNameKey, targetEnteredByKey) {
  var row = Number(candidate);
  if (!Number.isInteger(row) || row < FIRST_DATA_ROW) {
    return null;
  }

  var index = row - FIRST_DATA_ROW;
  if (index < 0 || index >= rows.length) {
    return null;
  }

  var existingName = cleanName_(rows[index][0]);
  if (!existingName) {
    return null;
  }

  var existingEnteredBy = cleanName_(rows[index][10]) || existingName;
  var sameName = normalizeKey_(existingName) === targetNameKey;
  var sameGroup = normalizeKey_(existingEnteredBy) === targetEnteredByKey;

  return sameName && sameGroup ? row : null;
}

function getChristmasSheet_() {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" not found.');
  }
  return sheet;
}

function parseJsonBody_(e) {
  var raw = e && e.postData && e.postData.contents
    ? e.postData.contents
    : '';
  return raw ? JSON.parse(raw) : {};
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeAgeGroup_(value) {
  var text = String(value || '').trim();
  return text === '10-' || text === '11+' ? text : '';
}

function normalizeFoods_(foodInput) {
  var items;

  if (Array.isArray(foodInput)) {
    items = foodInput;
  } else if (foodInput === undefined || foodInput === null) {
    items = [];
  } else {
    items = String(foodInput).split(/[;,\n]/);
  }

  var seen = {};
  var cleaned = [];

  items.slice(0, 20).forEach(function(item) {
    var text = cleanText_(item, 120);
    var key = normalizeKey_(text);
    if (!text || seen[key]) return;
    seen[key] = true;
    cleaned.push(text);
  });

  return cleaned.join('; ');
}

function cleanName_(value) {
  return cleanText_(value, 120);
}

function cleanText_(value, maxLength) {
  var text = String(value === undefined || value === null ? '' : value)
    .replace(/\s+/g, ' ')
    .trim();

  if (maxLength && text.length > maxLength) {
    text = text.slice(0, maxLength).trim();
  }
  return text;
}

function normalizeKey_(value) {
  return cleanText_(value, 500).toLowerCase();
}

function toShortName_(fullName) {
  var parts = cleanName_(fullName).split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];

  return parts[0] + ' ' + parts[parts.length - 1].charAt(0).toUpperCase() + '.';
}

function safeGetDisplayValue_(sheet, a1) {
  try {
    return sheet.getRange(a1).getDisplayValue();
  } catch (e) {
    return '';
  }
}
