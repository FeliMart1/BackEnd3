import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import mocksRouter from './routes/mocks.router.js';
import logger from './config/logger.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

app.use('/api/mocks', mocksRouter);

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mocksDB';
const port = process.env.PORT || 3000;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('🔌 Conectado a MongoDB');
  app.listen(port, () => {
    logger.info(`🚀 Servidor corriendo en http://localhost:${port}`);
  });
})
.catch(err => {
  logger.error('❌ Error conectando a MongoDB', err);
});
