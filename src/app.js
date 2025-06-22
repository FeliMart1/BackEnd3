import express from 'express';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import authRouter from './routes/auth.router.js';
import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionRouter from './routes/adoption.router.js';
import mocksRouter from './routes/mocks.router.js';
import errorHandler from './middlewares/errorHandler.js';
import { swaggerSpec, swaggerUiServe, swaggerUiSetup } from './docs/swagger.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

app.use('/docs', swaggerUiServe, swaggerUiSetup(swaggerSpec));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionRouter);
app.use('/api/mocks', mocksRouter);

app.use(errorHandler);

export default app;
