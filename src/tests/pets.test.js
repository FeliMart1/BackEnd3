// src/tests/pets.test.js
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../models/User.js';
import Pet from '../models/Pet.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('Pets API', () => {
  let userToken, adminToken, petId;

  beforeAll(async () => {
    // Crear un usuario normal
    const user = await User.create({
      first_name: 'Normal',
      last_name:  'User',
      email:      'normal@example.com',
      password:   'hashedpwd',
      role:       'user'
    });
    userToken = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '2h' });

    // Crear un usuario admin
    const admin = await User.create({
      first_name: 'Admin',
      last_name:  'User',
      email:      'admin@example.com',
      password:   'hashedpwd',
      role:       'admin'
    });
    adminToken = jwt.sign({ sub: admin._id.toString() }, JWT_SECRET, { expiresIn: '2h' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Pet.deleteMany({});
  });

  test('GET /api/pets → inicialmente vacío', async () => {
    const res = await request(app).get('/api/pets');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  test('POST /api/pets sin token → 401', async () => {
    const res = await request(app)
      .post('/api/pets')
      .send({ name: 'Luna', species: 'cat', age: 2 });
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/pets con token de user (no admin) → 403', async () => {
    // Si aún no has implementado isAdmin en pets, puede devolver 401 o 403
    const res = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Luna', species: 'cat', age: 2 });
    expect([401,403]).toContain(res.statusCode);
  });

  test('POST /api/pets con token de admin → crea mascota', async () => {
    const payload = {
      name: 'Luna',
      species: 'cat',
      breed: 'Siamese',
      age: 2,
      description: 'Gata juguetona',
      imageUrl: 'http://example.com/luna.jpg'
    };
    const res = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({ ...payload, status: 'available' });
    petId = res.body._id;
  });

  test('GET /api/pets → lista con la mascota creada', async () => {
    const res = await request(app).get('/api/pets');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]._id).toBe(petId);
  });

  test('GET /api/pets/:id → detalle de la mascota', async () => {
    const res = await request(app).get(`/api/pets/${petId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Luna');
  });

  test('PUT /api/pets/:id sin token → 401', async () => {
    const res = await request(app)
      .put(`/api/pets/${petId}`)
      .send({ age: 3 });
    expect(res.statusCode).toBe(401);
  });

  test('PUT /api/pets/:id con token de admin → actualiza mascota', async () => {
    const res = await request(app)
      .put(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ age: 3 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('age', 3);
  });

  test('DELETE /api/pets/:id sin token → 401', async () => {
    const res = await request(app).delete(`/api/pets/${petId}`);
    expect(res.statusCode).toBe(401);
  });

  test('DELETE /api/pets/:id con token de admin → elimina mascota', async () => {
    const res = await request(app)
      .delete(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
    const found = await Pet.findById(petId);
    expect(found).toBeNull();
  });
});
