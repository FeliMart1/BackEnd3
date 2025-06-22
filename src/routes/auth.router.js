// src/routes/auth.router.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { signupSchema, loginSchema } from '../utils/validators.js';
import logger from '../config/logger.js';

const router = express.Router();
const SALT_ROUNDS = 10;

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registra un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSignup'
 *     responses:
 *       '201':
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *       '400':
 *         description: Error de validación
 */
router.post('/signup', async (req, res, next) => {
  // Validación de entrada
  const { error } = signupSchema.validate(req.body);
  if (error) {
    logger.info('Validación fallida en signup', error);
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { first_name, last_name, email, password } = req.body;
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ first_name, last_name, email, password: hash });
    logger.info(`Usuario creado: ${user._id}`);
    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    logger.error('Error en signup', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Obtiene un JWT para un usuario existente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       '400':
 *         description: Error de validación
 *       '401':
 *         description: Credenciales inválidas
 */
router.post('/login', async (req, res, next) => {
  // Validación de entrada
  const { error } = loginSchema.validate(req.body);
  if (error) {
    logger.info('Validación fallida en login', error);
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logger.info(`Login fallido: usuario no encontrado (${email})`);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logger.info(`Login fallido: contraseña incorrecta para ${email}`);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({ token });
  } catch (err) {
    logger.error('Error en login', err);
    next(err);
  }
});

export default router;
