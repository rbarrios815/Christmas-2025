export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ✅ Your Apps Script URL (exec)
    const TARGET = "https://script.google.com/macros/s/AKfycbxyv1NvS2xlA-RwHh0czbD0gD73sGHTWwf69xBJoaMvwez-kTOCAvGbH4894mgP5cjg/exec";

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "https://rbarrios815.github.io",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    // Forward request to Apps Script
    const upstream = await fetch(TARGET, {
      method: request.method,
      headers: {
        "Content-Type": request.headers.get("Content-Type") || "text/plain;charset=utf-8"
      },
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text()
    });

    // Return response + add CORS
    const respText = await upstream.text();
    return new Response(respText, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "https://rbarrios815.github.io",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
};
