export function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Sign in to access your saved trips.' });
  }
  return next();
}
