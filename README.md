# Christmas-2025

Apps Script web app for the Christmas 2025 sign-up.

- `Code.gs` serves the HTML and connects to the Google Sheet backend.
- `Index.html` is the only template rendered by the web app (served via `HtmlService.createHtmlOutputFromFile('Index')`).

## How to make changes show up on the website

1. Edit `Index.html` (UI) or `Code.gs` (logic).
2. In the Apps Script editor, go to **Deploy → Manage deployments**.
3. Edit the existing Web app deployment, choose **Select type → Web app**, and pick the latest **Version** (create a new version if prompted).
4. Click **Deploy**. Updates usually appear immediately, but caches can take a few minutes to refresh; an incognito window often shows changes right away.

> Note: A lowercase `index.html` existed before but was not served by `Code.gs`; it was removed to avoid confusion. All UI edits should be in `Index.html`.

If you visit the repo via GitHub Pages, you'll see a placeholder `index.html` that simply explains the app is hosted through Apps Script. The live form is only reachable via the Apps Script Web App deployment URL.
