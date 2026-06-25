# Christmas 2025

A responsive Google Apps Script sign-up app backed by the **Christmas 2025** Google Sheet.

## What the app does

- One-step RSVP with no account or required dish
- Optional guest entry in a focused dialog
- Optional dish selection using mobile-friendly checkboxes
- Compact desktop dashboard with the RSVP and party summary visible together
- Short iPhone home screen with bottom navigation and sheet-style dialogs
- Nice List, dish lineup, gift rules, and contact details without one long scrolling page
- Apps Script first, with a direct JSON fallback for the GitHub Pages preview
- Duplicate protection based on both attendee name and the family member who entered the guest

## Files

- `Code.gs` — Apps Script backend, validation, locking, and Google Sheet reads/writes
- `index.html` — source-of-truth interface served by Apps Script and GitHub Pages
- `docs/index.html` — synchronized Pages copy of `index.html`
- `scripts/sync-docs.sh` — copies `index.html` to `docs/index.html`
- `.github/workflows/verify-docs-sync.yml` — prevents the Pages copy from drifting
- `appsscript.json` — Apps Script project settings

## Keep GitHub Pages in sync

After editing `index.html`, run:

```bash
./scripts/sync-docs.sh
```

The verification workflow checks that `index.html` and `docs/index.html` are identical.

## Deploy Apps Script changes

GitHub changes do not automatically update the existing Apps Script deployment unless a separate `clasp` deployment workflow is configured.

1. Copy `Code.gs`, `index.html`, and `appsscript.json` into the Apps Script project.
2. In Apps Script, choose **Deploy → Manage deployments**.
3. Edit the web app deployment and create a new version.
4. Confirm it runs as the deploying user and is accessible to anyone.

The current Google Sheet remains the source of event details, attendees, and dishes.
