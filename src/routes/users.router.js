// src/routes/users.router.js
import express from 'express';
import User from '../models/User.js';
import { auth } from '../middlewares/auth.js';
import { userUpdateSchema } from '../utils/validators.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtener el perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 role:
 *                   type: string
 *       '401':
 *         description: Token no proporcionado o inválido
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      logger.info(`Usuario no encontrado: ${req.user}`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    logger.error('Error al obtener perfil de usuario', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/users/me:
 *   put:
 *     tags:
 *       - Users
 *     summary: Actualizar el perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       '200':
 *         description: Perfil actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 role:
 *                   type: string
 *       '400':
 *         description: Validación fallida
 *       '401':
 *         description: Token no proporcionado o inválido
 *       '404':
 *         description: Usuario no encontrado
 */
router.put('/me', auth, async (req, res, next) => {
  const { error } = userUpdateSchema.validate(req.body);
  if (error) {
    logger.info('Validación fallida al actualizar usuario', error);
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const updated = await User.findByIdAndUpdate(
      req.user,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!updated) {
      logger.info(`Usuario no encontrado al actualizar: ${req.user}`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    logger.info(`Usuario actualizado: ${updated._id}`);
    res.json(updated);
  } catch (err) {
    logger.error('Error al actualizar usuario', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Listar todos los usuarios (requiere autenticación)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Array de usuarios (sin contraseñas)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   age:
 *                     type: integer
 *                   role:
 *                     type: string
 *       '401':
 *         description: Token no proporcionado o inválido
 */
router.get('/', auth, async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    logger.error('Error al listar usuarios', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/users/me:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Eliminar la cuenta del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '204':
 *         description: Cuenta eliminada correctamente
 *       '401':
 *         description: Token no proporcionado o inválido
 *       '404':
 *         description: Usuario no encontrado
 */
router.delete('/me', auth, async (req, res, next) => {
  try {
    const del = await User.findByIdAndDelete(req.user);
    if (!del) {
      logger.info(`Usuario no encontrado al eliminar: ${req.user}`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    logger.info(`Usuario eliminado: ${del._id}`);
    res.status(204).end();
  } catch (err) {
    logger.error('Error al eliminar usuario', err);
    next(err);
  }
});

export default router;
