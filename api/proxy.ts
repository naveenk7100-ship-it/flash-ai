export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // 1. CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const url = new URL(request.url);
  const ngrokHost =
    ((globalThis as any).process?.env?.UPSTREAM_HOST as string | undefined) ||
    'https://default-penholder-goes.ngrok-free.dev';

  // 2. Extract Route from __route query param or fallback headers
  let route = url.searchParams.get('__route');
  if (route) {
    url.searchParams.delete('__route');
    if (!route.startsWith('/')) {
      route = `/${route}`;
    }
  } else {
    const fwd = request.headers.get('x-forwarded-uri');
    if (fwd) {
      route = fwd.split('?')[0];
    } else {
      route = url.pathname;
    }
  }

  // Health check on /api/proxy itself
  if (route === '/api/proxy' || route === '/api/proxy/') {
    return new Response(
      JSON.stringify({ status: 'ok', proxy: 'active', upstream: ngrokHost }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  const queryString = url.searchParams.toString();
  const searchPart = queryString ? `?${queryString}` : '';
  const targetUrl = `${ngrokHost}${route}${searchPart}`;

  // 3. Prepare Forward Headers
  const forwardHeaders = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const lk = key.toLowerCase();
    // Exclude hop-by-hop headers and headers that interfere with upstream fetch
    if (lk === 'host' || lk === 'connection' || lk === 'content-length' || lk === 'accept-encoding') {
      continue;
    }
    forwardHeaders.set(key, value);
  }

  // CRITICAL: Always inject ngrok-skip-browser-warning to prevent ngrok ERR_NGROK_6024 HTML interstitial
  forwardHeaders.set('ngrok-skip-browser-warning', 'true');

  // 4. Body Handling for Mutations
  let body: BodyInit | undefined = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const ab = await request.arrayBuffer();
      if (ab.byteLength > 0) {
        body = ab;
      }
    } catch {
      // Body may be empty
    }
  }

  // 5. Upstream Fetch & Streaming Response
  try {
    const upstreamRes = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body,
    });

    const responseHeaders = new Headers();
    // Forward all relevant upstream headers
    for (const [k, v] of upstreamRes.headers.entries()) {
      const lk = k.toLowerCase();
      // Drop hop-by-hop or auto-managed encoding headers
      if (lk === 'transfer-encoding' || lk === 'content-encoding') {
        continue;
      }
      responseHeaders.set(k, v);
    }

    // Ensure CORS and media streaming support
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');
    if (!responseHeaders.has('accept-ranges')) {
      responseHeaders.set('accept-ranges', 'bytes');
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'Edge proxy upstream communication failed',
        message: err?.message || String(err),
        targetUrl,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
