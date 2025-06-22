import express from 'express';
import AdoptionRequest from '../models/AdoptionRequest.js';
import Pet from '../models/Pet.js';
import { auth } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { adoptionRequestSchema } from '../utils/validators.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * @openapi
 * /api/adoptions:
 *   post:
 *     tags:
 *       - Adoptions
 *     summary: Crear una nueva solicitud de adopción (usuario autenticado)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *             properties:
 *               petId:
 *                 type: string
 *                 description: ID de la mascota a solicitar
 *             example:
 *               petId: "60f5c2b9e3a2f213d4b8c1e7"
 *     responses:
 *       '201':
 *         description: Solicitud creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdoptionRequest'
 *       '400':
 *         description: Error de validación o mascota no disponible
 *       '401':
 *         description: Token no proporcionado o inválido
 *       '404':
 *         description: Mascota no encontrada
 */
router.post('/', auth, async (req, res, next) => {
  const { error } = adoptionRequestSchema.validate(req.body);
  if (error) {
    logger.info('Validación fallida al crear solicitud de adopción', error);
    return res.status(400).json({ error: error.details[0].message });
  }

  const { petId } = req.body;
  try {
    const pet = await Pet.findById(petId);
    if (!pet) {
      logger.info(`Mascota no encontrada al crear solicitud: ${petId}`);
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    if (pet.status !== 'available') {
      logger.info(`Solicitud para mascota no disponible: ${petId}`);
      return res.status(400).json({ error: 'Mascota no está disponible para adopción' });
    }

    const request = await AdoptionRequest.create({
      user: req.user,
      pet:  petId
    });
    logger.info(`Solicitud de adopción creada: ${request._id} por usuario ${req.user}`);
    res.status(201).json(request);
  } catch (err) {
    logger.error('Error al crear solicitud de adopción', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/adoptions:
 *   get:
 *     tags:
 *       - Adoptions
 *     summary: Listar solicitudes de adopción propias o de todos (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdoptionRequest'
 *       '401':
 *         description: Token no proporcionado o inválido
 */
router.get('/', auth, async (req, res, next) => {
  try {
    const filter = req.userIsAdmin
      ? {}
      : { user: req.user };

    const requests = await AdoptionRequest.find(filter)
      .populate('pet')
      .populate('user', '-password -role');
    res.json(requests);
  } catch (err) {
    logger.error('Error al listar solicitudes de adopción', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/adoptions/{id}/approve:
 *   put:
 *     tags:
 *       - Adoptions
 *     summary: Aprobar una solicitud de adopción (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la solicitud
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Solicitud aprobada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdoptionRequest'
 *       '400':
 *         description: Solo se pueden aprobar solicitudes pendientes
 *       '401':
 *         description: Token no proporcionado o inválido
 *       '403':
 *         description: No autorizado (no es admin)
 *       '404':
 *         description: Solicitud no encontrada
 */
router.put('/:id/approve', auth, isAdmin, async (req, res, next) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) {
      logger.info(`Solicitud no encontrada al aprobar: ${req.params.id}`);
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    if (request.status !== 'pending') {
      logger.info(`Intento de aprobar solicitud no pendiente: ${req.params.id}`);
      return res.status(400).json({ error: 'Solo se pueden aprobar solicitudes pendientes' });
    }

    request.status = 'approved';
    await request.save();
    await Pet.findByIdAndUpdate(request.pet, { status: 'adopted' }, { runValidators: true });

    logger.info(`Solicitud aprobada: ${request._id}`);
    res.json(request);
  } catch (err) {
    logger.error('Error al aprobar solicitud', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/adoptions/{id}/reject:
 *   put:
 *     tags:
 *       - Adoptions
 *     summary: Rechazar una solicitud de adopción (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la solicitud
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Solicitud rechazada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdoptionRequest'
 *       '400':
 *         description: Solo se pueden rechazar solicitudes pendientes
 *       '401':
 *         description: Token no proporcionado o inválido
 *       '403':
 *         description: No autorizado (no es admin)
 *       '404':
 *         description: Solicitud no encontrada
 */
router.put('/:id/reject', auth, isAdmin, async (req, res, next) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) {
      logger.info(`Solicitud no encontrada al rechazar: ${req.params.id}`);
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    if (request.status !== 'pending') {
      logger.info(`Intento de rechazar solicitud no pendiente: ${req.params.id}`);
      return res.status(400).json({ error: 'Solo se pueden rechazar solicitudes pendientes' });
    }

    request.status = 'rejected';
    await request.save();

    logger.info(`Solicitud rechazada: ${request._id}`);
    res.json(request);
  } catch (err) {
    logger.error('Error al rechazar solicitud', err);
    next(err);
  }
});

/**
 * @openapi
 * /api/adoptions/{id}:
 *   delete:
 *     tags:
 *       - Adoptions
 *     summary: Eliminar una solicitud propia o como admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la solicitud
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Solicitud eliminada correctamente
 *       '401':
 *         description: Token no proporcionado o inválido
 *       '403':
 *         description: No autorizado para eliminar esta solicitud
 *       '404':
 *         description: Solicitud no encontrada
 */
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) {
      logger.info(`Solicitud no encontrada al eliminar: ${req.params.id}`);
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    if (request.user.toString() !== req.user && !req.userIsAdmin) {
      logger.info(`Usuario ${req.user} no autorizado para eliminar solicitud ${req.params.id}`);
      return res.status(403).json({ error: 'No autorizado para eliminar esta solicitud' });
    }

    await request.deleteOne();
    logger.info(`Solicitud eliminada: ${request._id}`);
    res.status(204).end();
  } catch (err) {
    logger.error('Error al eliminar solicitud', err);
    next(err);
  }
});

export default router;
