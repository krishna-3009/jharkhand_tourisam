export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;
  if (error.message === 'This website is not allowed to use the authentication API.') {
    return res.status(403).json({ error: error.message });
  }
  if (error.status === 400) {
    return res.status(400).json({ error: 'Request body is not valid JSON.' });
  }
  console.error(error);
  return res.status(500).json({ error: 'The server could not complete the request. Check the API and database logs.' });
}
