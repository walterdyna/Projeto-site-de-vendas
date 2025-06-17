const request = require('supertest');
const mongoose = require('mongoose');
const { createRequire } = require('module');
const requireModule = createRequire(import.meta.url);
const app = requireModule('../server.js');

let tokenAdmin;
let tokenUser;
let createdProductId;
let createdUserId;

beforeAll(async () => {
  // Login admin
  const resAdmin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'alexdyna', password: 'senha123' });
  tokenAdmin = resAdmin.body.token;

  // Login user comum (criar se necessário)
  const resUser = await request(app)
    .post('/api/auth/login')
    .send({ username: 'usercomum', password: 'senha123' });
  tokenUser = resUser.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Testes API Produtos', () => {
  test('Criar produto - sucesso', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .field('productName', 'Produto Teste')
      .field('productPrice', '10.50')
      .field('productStock', '100')
      .field('productDescription', 'Descrição teste')
      .field('productCategory', 'Categoria teste')
      .field('productOrigin', 'Origem teste');
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Produto Teste');
    createdProductId = res.body._id;
  });

  test('Criar produto - falha sem token', async () => {
    const res = await request(app)
      .post('/api/products')
      .field('productName', 'Produto Teste 2');
    expect(res.statusCode).toBe(401);
  });

  test('Listar produtos', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Atualizar produto - sucesso', async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ productPrice: 20.0 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(20.0);
  });

  test('Atualizar produto - falha sem token', async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .send({ productPrice: 30.0 });
    expect(res.statusCode).toBe(401);
  });

  test('Deletar produto - sucesso', async () => {
    const res = await request(app)
      .delete(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });

  test('Deletar produto - falha sem token', async () => {
    const res = await request(app)
      .delete(`/api/products/${createdProductId}`);
    expect(res.statusCode).toBe(401);
  });

  test('Validar estoque - sucesso', async () => {
    const res = await request(app)
      .post('/api/products/validate-stock')
      .send({ productId: createdProductId, quantity: 1 });
    expect([200, 404, 400]).toContain(res.statusCode);
  });
});

describe('Testes API Usuários', () => {
  test('Criar usuário - sucesso', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ username: 'userTest', password: 'senha123', isAdmin: false });
    expect(res.statusCode).toBe(201);
    createdUserId = res.body.user._id || res.body.user.id;
  });

  test('Criar usuário - falha usuário existente', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ username: 'userTest', password: 'senha123' });
    expect(res.statusCode).toBe(400);
  });

  test('Listar usuários - sucesso', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Listar usuários - falha sem token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
  });

  test('Deletar usuário - sucesso', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.statusCode).toBe(200);
  });

  test('Deletar usuário - falha sem token', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`);
    expect(res.statusCode).toBe(401);
  });
});
