# Christmas-2025

Apps Script web app for the Christmas 2025 sign-up.

- `Code.gs` serves the HTML and connects to the Google Sheet backend.
- `index.html` is the template rendered by the web app (served via `HtmlService.createHtmlOutputFromFile('index')`).
- `docs/index.html` is a copy of the template so GitHub Pages can serve a preview; keep it in sync with `index.html` when making changes.

## Configure the Apps Script API URL

1. Deploy the Apps Script project as a Web App that runs as you and is accessible to anyone with the link.
2. Copy the `/exec` URL from the deployment.
3. Deploy the Cloudflare Worker proxy (instructions below) and copy the Worker URL (e.g. `https://your-worker.workers.dev`).
4. Paste the Worker URL into the `APPS_SCRIPT_API_URL` constant near the top of `index.html` and `docs/index.html` so GitHub Pages uses the proxy instead of calling Apps Script directly.

## Deploy the Cloudflare Worker proxy

1. Create a new Worker in the Cloudflare dashboard (or via `wrangler init`) and replace its contents with `worker.js` from this repo.
2. No environment variables are required; the Apps Script `/exec` URL is hard-coded near the top of `worker.js`.
3. Deploy the Worker and note the public URL (e.g. `https://your-worker.workers.dev`).
4. Update `APPS_SCRIPT_API_URL` in `index.html` and `docs/index.html` to the Worker URL so CORS preflight requests succeed.

## Redeploying Apps Script after changes

After updating `Code.gs` or other server logic:

1. Open the Apps Script editor.
2. Choose **Deploy > Manage deployments**.
3. Create a new version (or update the existing Web App) so the latest server changes are live.
