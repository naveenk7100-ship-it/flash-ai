export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  // Extract path following /media/ or /api/media/
  const mediaPath = url.pathname
    .replace(/^\/api\/media\//, '')
    .replace(/^\/media\//, '');

  const ngrokHost =
    ((globalThis as any).process?.env?.UPSTREAM_HOST as string | undefined) ||
    'https://default-penholder-goes.ngrok-free.dev';
  const targetUrl = `${ngrokHost}/media/${mediaPath}${url.search}`;

  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.set('ngrok-skip-browser-warning', 'true');
  // Avoid host header mismatch on upstream
  forwardHeaders.delete('host');

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
    });

    const responseHeaders = new Headers(upstreamRes.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type, ngrok-skip-browser-warning');

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Media stream proxy failed', message: err.message }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
