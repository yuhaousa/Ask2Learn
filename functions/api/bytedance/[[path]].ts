/**
 * Cloudflare Pages Function: ByteDance API Proxy
 * Route: /api/bytedance/*
 *
 * Proxies requests to the ByteDance (BytePlus) API so that:
 *  - The API key is kept server-side (never exposed in the browser bundle)
 *  - CORS restrictions are bypassed
 *
 * Required environment variable (set in Cloudflare Pages dashboard):
 *  BYTEDANCE_API_KEY  — your BytePlus API key
 *  BYTEDANCE_BASE_URL — (optional) defaults to https://ark.ap-southeast.bytepluses.com/api/v3
 */

interface Env {
  BYTEDANCE_API_KEY: string;
  BYTEDANCE_BASE_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
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

  // Reconstruct the upstream path
  const pathSegments = (params.path as string[] | undefined) ?? [];
  const upstreamPath = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '';

  // Preserve query string
  const originalUrl = new URL(request.url);
  const targetUrl = `${baseUrl}${upstreamPath}${originalUrl.search}`;

  // Forward request with server-side API key
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
  // Attach CORS headers so the browser accepts the response
  for (const [k, v] of Object.entries(corsHeaders())) {
    responseHeaders.set(k, v);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
};

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
