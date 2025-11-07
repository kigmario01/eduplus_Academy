import crypto from 'crypto';

// Simple CSRF middleware using double-submit cookie pattern.
// 1) Issue a CSRF token and set it in a cookie `csrfToken` (SameSite=Lax)
// 2) For mutating requests, require header `x-csrf-token` to match cookie value

export const issueCsrfToken = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  // Set cookie with SameSite=Lax to protect against CSRF on top-level navigations
  res.cookie('csrfToken', token, {
    httpOnly: false, // SPA reads cookie
    secure: false,   // set true behind HTTPS
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 1000 // 1 hour
  });
  return res.json({ success: true, token });
};

export const requireCsrf = (req, res, next) => {
  const method = req.method.toUpperCase();
  const needsCheck = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  if (!needsCheck) return next();

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.csrfToken;

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ success: false, message: 'CSRF token inválido o ausente' });
  }
  next();
};