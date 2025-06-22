import express from 'express';
import Pet from '../models/Pet.js';
import { auth } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { petSchema, petUpdateSchema } from '../utils/validators.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * @openapi
 * /api/pets:
 *   get:
 *     tags:
 *       - Pets
 *     summary: Listar todas las mascotas disponibles
 *     responses:
 *       '200':
 *         description: Array de mascotas disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pet'
 */
router.get('/', async (req, res, next) => {
  try {
    const pets = await Pet.find({ status: 'available' });
    res.json(pets);
  } catch (err) {
    logger.error('Error al obtener mascotas', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/pets/{id}:
 *   get:
 *     tags:
 *       - Pets
 *     summary: Obtener detalle de una mascota por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la mascota
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Detalle de la mascota
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       '404':
 *         description: Mascota no encontrada
 */
router.get('/:id', async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      logger.info(`Mascota no encontrada: ${req.params.id}`);
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    res.json(pet);
  } catch (err) {
    logger.error('Error al obtener mascota por ID', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/pets:
 *   post:
 *     tags:
 *       - Pets
 *     summary: Crear una nueva mascota (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pet'
 *     responses:
 *       '201':
 *         description: Mascota creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       '400':
 *         description: Validación fallida
 *       '401':
 *         description: Token no proporcionado o inválido
 *       '403':
 *         description: No autorizado (no es admin)
 */
router.post('/', auth, isAdmin, async (req, res, next) => {
  const { error } = petSchema.validate(req.body);
  if (error) {
    logger.info('Validación fallida al crear mascota', error);
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const newPet = new Pet(req.body);
    const savedPet = await newPet.save();
    logger.info(`Mascota creada: ${savedPet._id}`);
    res.status(201).json(savedPet);
  } catch (err) {
    logger.error('Error al crear mascota', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/pets/{id}:
 *   put:
 *     tags:
 *       - Pets
 *     summary: Actualizar una mascota existente (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la mascota
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pet'
 *     responses:
 *       '200':
 *         description: Mascota actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       '400':
 *         description: Validación fallida
 *       '401':
 *         description: Token no proporcionado o inválido
 *       '403':
 *         description: No autorizado (no es admin)
 *       '404':
 *         description: Mascota no encontrada
 */
router.put('/:id', auth, isAdmin, async (req, res, next) => {
  const { error } = petUpdateSchema.validate(req.body);
  if (error) {
    logger.info('Validación fallida al actualizar mascota', error);
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPet) {
      logger.info(`Mascota no encontrada para actualización: ${req.params.id}`);
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    logger.info(`Mascota actualizada: ${updatedPet._id}`);
    res.json(updatedPet);
  } catch (err) {
    logger.error('Error al actualizar mascota', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/pets/{id}:
 *   delete:
 *     tags:
 *       - Pets
 *     summary: Eliminar una mascota (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la mascota
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Mascota eliminada correctamente
 *       '401':
 *         description: Token no proporcionado o inválido
 *       '403':
 *         description: No autorizado (no es admin)
 *       '404':
 *         description: Mascota no encontrada
 */
router.delete('/:id', auth, isAdmin, async (req, res, next) => {
  try {
    const deletedPet = await Pet.findByIdAndDelete(req.params.id);
    if (!deletedPet) {
      logger.info(`Intento de eliminar mascota no existente: ${req.params.id}`);
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    logger.info(`Mascota eliminada: ${deletedPet._id}`);
    res.status(204).end();
  } catch (err) {
    logger.error('Error al eliminar mascota', err);
    next(err);
  }
});

export default router;
