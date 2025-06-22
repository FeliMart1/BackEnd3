// src/tests/adoption.test.js
import request from 'supertest';
import jwt from 'jsonwebtoken';

// IMPORTS RELATIVOS DESDE src/tests → sube un nivel a src/
import app from '../app.js';
import User from '../models/User.js';
import Pet from '../models/Pet.js';
import AdoptionRequest from '../models/AdoptionRequest.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('Adoption API', () => {
  let token, userId, petId, requestId;

  beforeAll(async () => {
    // Crear usuario de prueba
    const user = await User.create({
      first_name: 'Test',
      last_name:  'User',
      email:      'test@example.com',
      password:   'hashedpassword', // no importa el hash
    });
    userId = user._id.toString();
    token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '2h' });

    // Crear mascota disponible
    const pet = await Pet.create({
      name:    'Firulais',
      species: 'dog',
      age:     4,
    });
    petId = pet._id.toString();
  });

  test('POST /api/adoptions → crea una solicitud', async () => {
    const res = await request(app)
      .post('/api/adoptions')
      .set('Authorization', `Bearer ${token}`)
      .send({ petId });

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      pet: petId,
      user: userId,
      status: 'pending'
    });
    requestId = res.body._id;
  });

  test('GET /api/adoptions → lista solicitudes propias', async () => {
    const res = await request(app)
      .get('/api/adoptions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('_id', requestId);
  });

  test('PUT /api/adoptions/:id/approve → devuelve 403 si no es admin', async () => {
    const res = await request(app)
      .put(`/api/adoptions/${requestId}/approve`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  test('DELETE /api/adoptions/:id → elimina propia solicitud', async () => {
    const res = await request(app)
      .delete(`/api/adoptions/${requestId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);

    // Verificar en BD
    const again = await AdoptionRequest.findById(requestId);
    expect(again).toBeNull();
  });
});
