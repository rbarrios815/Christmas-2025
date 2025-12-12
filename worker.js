const APPS_SCRIPT_EXEC_URL = 'https://script.google.com/macros/s/AKfycbxyv1NvS2xlA-RwHh0czbD0gD73sGHTWwf69xBJoaMvwez-kTOCAvGbH4894mgP5cjg/exec';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

async function handlePost(request) {
  const upstreamResponse = await fetch(APPS_SCRIPT_EXEC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: await request.text()
  });

  const responseBody = await upstreamResponse.text();
  const response = new Response(responseBody, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: {
      ...corsHeaders
    }
  });

  const contentType = upstreamResponse.headers.get('content-type');
  if (contentType) {
    response.headers.set('Content-Type', contentType);
  }

  return response;
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  return handlePost(request);
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
};
