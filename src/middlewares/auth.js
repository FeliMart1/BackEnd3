import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token requerido' });
  const token = header.replace('Bearer ', '');
  const secret = process.env.JWT_SECRET || 'test-secret';
  try {
    const payload = jwt.verify(token, secret);
    req.user = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}
