import mongoose from 'mongoose';
import logger from '../config/logger.js';

export function connectDB(uri) {
  return mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info('🔌 Conectado a MongoDB'))
  .catch(err => {
    logger.error('❌ Error conectando a MongoDB', err);
    process.exit(1);
  });
}
