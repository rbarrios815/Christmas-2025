// Code.gs
// Christmas 2025 Web App – Sheet backend

const SHEET_ID = '1U8foSVSKKCykTFv9fz7nvldVZoYq0aY_n6Yeo1z7Pr0';
const SHEET_NAME = 'Christmas 2025 Sheet 1';
const HEADER_ROW = 1;
const FIRST_DATA_ROW = 2;

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Christmas 2025 Sign-Up');
}

/**
 * Returns:
 * {
 *   meta: {time, date, address, questions},
 *   attendees: [
 *     { row, fullName, shortName, ageGroup, food, gameVote, cashVote, enteredBy }
 *   ],
 *   menu: [ 'Mashed potatoes', 'Turkey', ... ]
 * }
 */
function getChristmasData() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" not found.');
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < FIRST_DATA_ROW) {
    lastRow = FIRST_DATA_ROW - 1;
  }

  var attendees = [];
  if (lastRow >= FIRST_DATA_ROW) {
    // Columns A–K (11 columns)
    var rows = sheet
      .getRange(FIRST_DATA_ROW, 1, lastRow - FIRST_DATA_ROW + 1, 11)
      .getValues();

    rows.forEach(function(rowVals, idx) {
      var fullName = rowVals[0];              // Col A
      if (!fullName) return;                  // skip blank

      attendees.push({
        row: FIRST_DATA_ROW + idx,
        fullName: fullName,
        shortName: toShortName_(fullName),
        ageGroup: rowVals[1] || '',           // Col B: 11+ or 10-
        food: rowVals[2] || '',               // Col C
        gameVote: rowVals[3] === '👍',        // Col D
        cashVote: rowVals[4] === '👍',        // Col E
        enteredBy: rowVals[10] || ''          // Col K
      });
    });
  }

  // Meta info (admin only edits these directly in the sheet)
  var time = safeGetDisplayValue_(sheet, 'F2'); // Time
  var date = safeGetDisplayValue_(sheet, 'G2'); // Date (12/24)
  var address = safeGetDisplayValue_(sheet, 'H2');
  var questions = safeGetDisplayValue_(sheet, 'I2');

  // Menu items in column J starting at J2
  var lastMenuRow = sheet.getLastRow();
  var menuValues = [];
  if (lastMenuRow >= FIRST_DATA_ROW) {
    menuValues = sheet
      .getRange(FIRST_DATA_ROW, 10, lastMenuRow - FIRST_DATA_ROW + 1, 1) // col 10 = J
      .getValues()
      .map(function(r) { return r[0]; })
      .filter(function(v) { return v; });
  }

  return {
    meta: {
      time: time,
      date: date,
      address: address,
      questions: questions
    },
    attendees: attendees,
    menu: menuValues
  };
}

/**
 * Save or update an attendee.
 * Input: {
 *   row: (optional row number if existing),
 *   fullName,
 *   ageGroup,   // '11+' or '10-'
 *   food,       // menu item text or ''
 *   gameVote: true/false,
 *   cashVote: true/false,
 *   enteredBy   // name of person submitting (used only when first created)
 * }
 *
 * Returns updated getChristmasData() snapshot.
 */
function saveAttendee(att) {
  if (!att || !att.fullName) {
    throw new Error('Full name is required.');
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" not found.');
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < FIRST_DATA_ROW) {
    lastRow = FIRST_DATA_ROW - 1;
  }

  var row = att.row || null;

  // If row is not provided, try finding existing row by full name (case-insensitive)
  if (!row && lastRow >= FIRST_DATA_ROW) {
    var nameRange = sheet.getRange(FIRST_DATA_ROW, 1, lastRow - FIRST_DATA_ROW + 1, 1);
    var names = nameRange.getValues();
    var target = att.fullName.toString().trim().toLowerCase();

    for (var i = 0; i < names.length; i++) {
      var existing = (names[i][0] || '').toString().trim().toLowerCase();
      if (existing && existing === target) {
        row = FIRST_DATA_ROW + i;
        break;
      }
    }
  }

  // If still no row, append a new one
  if (!row) {
    row = lastRow + 1;
  }

  var food = att.food || '';

  // Enforce: a menu item in column C can only be chosen by one attendee
  if (food) {
    var menuLastRow = sheet.getLastRow();
    if (menuLastRow >= FIRST_DATA_ROW) {
      var foodRange = sheet.getRange(FIRST_DATA_ROW, 3, menuLastRow - FIRST_DATA_ROW + 1, 1);
      var foodValues = foodRange.getValues();

      for (var j = 0; j < foodValues.length; j++) {
        var existingFood = foodValues[j][0];
        var existingRow = FIRST_DATA_ROW + j;

        if (existingRow === row) continue; // ignore same row on update
        if (existingFood && existingFood === food) {
          throw new Error('That menu item is already taken. Please choose another.');
        }
      }
    }
  }

  // Write main values
  sheet.getRange(row, 1).setValue(att.fullName);          // Col A: Name of Person Attending
  sheet.getRange(row, 2).setValue(att.ageGroup || '');    // Col B: 11+ / 10-
  sheet.getRange(row, 3).setValue(food);                  // Col C: Food signup

  sheet.getRange(row, 4).setValue(att.gameVote ? '👍' : '');  // Col D: White Elephant vote
  sheet.getRange(row, 5).setValue(att.cashVote ? '👍' : '');  // Col E: Cash donation vote

  // Col K: Entered By – set only if blank, so the original "inviter" is preserved
  var enteredByCell = sheet.getRange(row, 11);
  if (!enteredByCell.getValue()) {
    enteredByCell.setValue(att.enteredBy || att.fullName);
  }

  // Return updated snapshot so the UI can re-render
  return getChristmasData();
}

// Helper: convert "First Middle Last" → "First L."
function toShortName_(fullName) {
  if (!fullName) return '';
  var parts = fullName.toString().trim().split(/\s+/);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];

  var first = parts[0];
  var last = parts[parts.length - 1];
  return first + ' ' + (last.charAt(0).toUpperCase() || '') + '.';
}

function safeGetDisplayValue_(sheet, a1) {
  try {
    return sheet.getRange(a1).getDisplayValue();
  } catch (e) {
    return '';
  }
}
