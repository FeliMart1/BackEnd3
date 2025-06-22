import User from '../models/User.js';

export async function isAdmin(req, res, next) {
  const user = await User.findById(req.user);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Requiere rol admin' });
  }
  req.userIsAdmin = true;
  next();
}
