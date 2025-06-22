import express from 'express';
import { generateMockUsers } from '../mocks/mockUsers.js';
import { generateMockProducts } from '../mocks/mockProducts.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * @openapi
 * /api/mocks:
 *   get:
 *     tags:
 *       - Mocks
 *     summary: Comprueba que la API de mocks está funcionando
 *     responses:
 *       '200':
 *         description: API de mocks operativa
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Mocking API funcionando!"
 */
router.get('/', (req, res) => {
  logger.http('GET /api/mocks');
  res.send('Mocking API funcionando!');
});

/**
 * @openapi
 * /api/mocks/{users}/{products}:
 *   post:
 *     tags:
 *       - Mocks
 *     summary: Genera datos falsos de usuarios y productos
 *     parameters:
 *       - name: users
 *         in: path
 *         required: true
 *         description: Número de usuarios a generar
 *         schema:
 *           type: integer
 *       - name: products
 *         in: path
 *         required: true
 *         description: Número de productos a generar
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Datos mock generados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Datos mock generados correctamente"
 *                 users:
 *                   type: integer
 *                   example: 10
 *                 products:
 *                   type: integer
 *                   example: 15
 *       '400':
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Los parámetros deben ser números"
 *       '500':
 *         description: Error interno al generar datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error generando datos mock"
 */
router.post('/:users/:products', async (req, res) => {
  const userCount = parseInt(req.params.users, 10);
  const productCount = parseInt(req.params.products, 10);

  if (isNaN(userCount) || isNaN(productCount)) {
    logger.info(`Parámetros inválidos: users=${req.params.users}, products=${req.params.products}`);
    return res.status(400).json({ error: 'Los parámetros deben ser números' });
  }

  try {
    const users = generateMockUsers(userCount);
    const products = generateMockProducts(productCount);

    const insertedUsers = await User.insertMany(users);
    const insertedProducts = await Product.insertMany(products);

    logger.info(`🧪 Se crearon ${insertedUsers.length} usuarios y ${insertedProducts.length} productos`);
    res.json({
      message: 'Datos mock generados correctamente',
      users: insertedUsers.length,
      products: insertedProducts.length,
    });
  } catch (err) {
    logger.error('❌ Error generando datos mock', err);
    res.status(500).json({ error: 'Error generando datos mock' });
  }
});

export default router;
