# Christmas-2025

Apps Script web app for the Christmas 2025 sign-up.

- `Code.gs` serves the HTML and connects to the Google Sheet backend.
- `Index.html` is the only template rendered by the web app (served via `HtmlService.createHtmlOutputFromFile('Index')`).

Note: a duplicate `index.html` file was removed to avoid confusion. Make UI changes in `Index.html` so they appear on the published site.
