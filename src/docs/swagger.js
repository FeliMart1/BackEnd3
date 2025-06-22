import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ADOPTME API',
    version: '1.0.0',
    description: 'API REST para la gestión de adopción de mascotas',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      UserSignup: {
        type: 'object',
        required: ['first_name', 'last_name', 'email', 'password'],
        properties: {
          first_name: { type: 'string' },
          last_name:  { type: 'string' },
          email:      { type: 'string', format: 'email' },
          password:   { type: 'string', format: 'password' },
        },
      },
      AuthSignupResponse: {
        type: 'object',
        properties: {
          id:    { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
      },
      AuthLoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
      },
      Pet: {
        type: 'object',
        properties: {
          _id:         { type: 'string' },
          name:        { type: 'string' },
          species:     { type: 'string' },
          breed:       { type: 'string' },
          age:         { type: 'integer' },
          description: { type: 'string' },
          imageUrl:    { type: 'string', format: 'uri' },
          status:      { type: 'string', enum: ['available','adopted'] },
        },
      },
      AdoptionRequest: {
        type: 'object',
        properties: {
          _id:    { type: 'string' },
          user:   { type: 'string', description: 'ID del usuario' },
          pet:    { type: 'string', description: 'ID de la mascota' },
          status: { type: 'string', enum: ['pending','approved','rejected'] },
        },
      },
      UserUpdate: {
        type: 'object',
        minProperties: 1,
        properties: {
          first_name: { type: 'string' },
          last_name:  { type: 'string' },
          email:      { type: 'string', format: 'email' },
          age:        { type: 'integer' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], 
};

export const swaggerSpec = swaggerJSDoc(options);
export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup;
