// src/server.js
import dotenv from 'dotenv';
import logger from './config/logger.js';
import { connectDB } from './db/connection.js';
import app from './app.js';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mocksDB';
const port     = process.env.PORT    || 3000;

connectDB(mongoURI).then(() => {
  app.listen(port, () => {
    logger.info(`🚀 Servidor corriendo en http://localhost:${port}`);
  });
});
