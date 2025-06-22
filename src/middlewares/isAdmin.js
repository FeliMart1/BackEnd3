// middlewares/isAdmin.js
import User from '../models/User.js';

export async function isAdmin(req, res, next) {
  const user = await User.findById(req.user);
  // Si no existe o no es admin, rechazamos con 403
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Requiere rol admin' });
  }
  // Marcamos la bandera para rutas que la comprueben
  req.userIsAdmin = true;
  next();
}
