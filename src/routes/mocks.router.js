import express from 'express';
import { generateMockUsers } from '../mocks/mockUsers.js';
import { generateMockProducts } from '../mocks/mockProducts.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Mocking API funcionando!');
});

router.post('/:users/:products', async (req, res) => {
  const userCount = parseInt(req.params.users);
  const productCount = parseInt(req.params.products);

  if (isNaN(userCount) || isNaN(productCount)) {
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
