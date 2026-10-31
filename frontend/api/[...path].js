const defaultApiOrigin = 'https://jharkhand-tourism-api.onrender.com';
const forwardedRequestHeaders = ['accept', 'content-type', 'cookie', 'origin'];
const forwardedResponseHeaders = [
  'cache-control',
  'content-type',
  'vary',
  'access-control-allow-origin',
  'access-control-allow-credentials',
];

export default async function handler(request, response) {
  const apiOrigin = (process.env.API_ORIGIN || defaultApiOrigin).replace(/\/+$/, '');
  const pathValue = request.query?.path;
  const pathSegments = Array.isArray(pathValue) ? pathValue : [pathValue];
  const apiPath = pathSegments.filter(Boolean).map((segment) => encodeURIComponent(segment)).join('/');
  if (!apiPath) return response.status(400).json({ error: 'An API path is required.' });

  let upstreamUrl;
  try {
    upstreamUrl = new URL(`/api/${apiPath}`, apiOrigin);
  } catch {
    return response.status(500).json({ error: 'The API proxy is not configured with a valid API_ORIGIN.' });
  }
  const requestUrl = new URL(request.url, 'https://vercel.invalid');
  requestUrl.searchParams.forEach((value, key) => {
    if (key !== 'path') upstreamUrl.searchParams.append(key, value);
  });

  const headers = new Headers();
  for (const key of forwardedRequestHeaders) {
    const value = request.headers[key];
    if (typeof value === 'string') headers.set(key, value);
  }

  let body;
  if (!['GET', 'HEAD'].includes(request.method)) {
    try {
      const parsedBody = request.body;
      if (parsedBody !== undefined && parsedBody !== null) {
        body = typeof parsedBody === 'string' || Buffer.isBuffer(parsedBody)
          ? parsedBody
          : JSON.stringify(parsedBody);
      }
    } catch {
      return response.status(400).json({ error: 'Request body is not valid JSON.' });
    }
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      ...(body !== undefined ? { body } : {}),
      redirect: 'manual',
    });

    response.status(upstream.status);
    for (const key of forwardedResponseHeaders) {
      const value = upstream.headers.get(key);
      if (value) response.setHeader(key, value);
    }
    const cookies = upstream.headers.getSetCookie?.();
    if (cookies?.length) response.setHeader('Set-Cookie', cookies);
    else {
      const cookie = upstream.headers.get('set-cookie');
      if (cookie) response.setHeader('Set-Cookie', cookie);
    }

    const responseBody = Buffer.from(await upstream.arrayBuffer());
    return response.send(responseBody);
  } catch (error) {
    console.error('Vercel API proxy request failed:', error.message);
    return response.status(502).json({ error: 'The tourism API is temporarily unavailable.' });
  }
}
