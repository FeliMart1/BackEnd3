// src/tests/users.test.js
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('Users API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Creamos un usuario de prueba directamente en la BD
    const user = await User.create({
      first_name: 'Juan',
      last_name:  'Perez',
      email:      'juan.perez@example.com',
      password:   'hashedpassword', // el hash real no importa aquí
      // role: 'user' por defecto
    });
    userId = user._id.toString();

    // Generamos un JWT válido para este user
    token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '2h' });
  });

  afterAll(async () => {
    // Limpieza final de la colección de usuarios
    await User.deleteMany({});
  });

  test('GET /api/users/me → devuelve perfil propio', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      _id:        userId,
      email:      'juan.perez@example.com',
      first_name: 'Juan',
      last_name:  'Perez',
    });
    // Aseguramos que no venga la contraseña
    expect(res.body).not.toHaveProperty('password');
  });

  test('PUT /api/users/me → actualiza perfil', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Luis', age: 30 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      _id:        userId,
      first_name: 'Luis',
      age:        30,
    });
  });

  test('GET /api/users → lista usuarios (sin admin)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    // Actualmente solo requiere auth, devuelve array
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Debe contener al menos nuestro usuario
    const emails = res.body.map(u => u.email);
    expect(emails).toContain('juan.perez@example.com');
  });

  test('DELETE /api/users/me → elimina cuenta propia', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);

    // Verificamos que el usuario ya no existe
    const found = await User.findById(userId);
    expect(found).toBeNull();
  });
});
