# Christmas-2025

Apps Script web app for the Christmas 2025 sign-up.

- `Code.gs` serves the HTML and connects to the Google Sheet backend.
- `index.html` is the template rendered by the web app (served via `HtmlService.createHtmlOutputFromFile('index')`).
- `docs/index.html` is a copy of the template so GitHub Pages can serve a preview; keep it in sync with `index.html` when making changes. Run `./scripts/sync-docs.sh` after editing `index.html` to copy the latest HTML into `docs/`.

## Configure the Apps Script API URL

1. Deploy the Apps Script project as a Web App that runs as you and is accessible to anyone with the link.
2. Copy the `/exec` URL from the deployment.
3. Paste the Apps Script `/exec` URL into the `APPS_SCRIPT_API_URL` constant near the top of `index.html` and `docs/index.html` so GitHub Pages can call it directly.

> Note: The older Cloudflare Worker proxy is optional and no longer required now that the client calls the Apps Script URL directly with `text/plain` requests. The `worker.js` file remains for reference.

## Redeploying Apps Script after changes

After updating `Code.gs` or other server logic:

1. Open the Apps Script editor.
2. Choose **Deploy > Manage deployments**.
3. Create a new version (or update the existing Web App) so the latest server changes are live.
