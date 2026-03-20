/**
 * Cloudflare Worker entry point for Ask2Learn
 *
 * Handles:
 *  1. /api/bytedance/* — proxies to ByteDance API server-side (keeps API key secret)
 *  2. Everything else   — serves static files from dist/ (Workers Assets)
 *                         with SPA fallback to index.html for client-side routing
 *
 * Required environment variables (set in Cloudflare Workers dashboard):
 *  BYTEDANCE_API_KEY   — your BytePlus API key
 *  BYTEDANCE_BASE_URL  — (optional) defaults to BytePlus endpoint
 */

interface Env {
  ASSETS: Fetcher;
  BYTEDANCE_API_KEY: string;
  BYTEDANCE_BASE_URL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Route ByteDance API calls through server-side proxy
    if (url.pathname.startsWith('/api/bytedance')) {
      return handleByteDanceProxy(request, env, url);
    }

    // Serve static assets; fall back to index.html for SPA routes
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 404) {
      const indexRequest = new Request(new URL('/index.html', request.url).toString(), request);
      return env.ASSETS.fetch(indexRequest);
    }
    return assetResponse;
  },
};

async function handleByteDanceProxy(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const apiKey = env.BYTEDANCE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'BYTEDANCE_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  const baseUrl =
    env.BYTEDANCE_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3';
  const upstreamPath = url.pathname.replace('/api/bytedance', '');
  const targetUrl = `${baseUrl}${upstreamPath}${url.search}`;

  const upstreamRequest = new Request(targetUrl, {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
  });

  const upstream = await fetch(upstreamRequest);
  const responseHeaders = new Headers(upstream.headers);
  for (const [k, v] of Object.entries(corsHeaders())) {
    responseHeaders.set(k, v);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
