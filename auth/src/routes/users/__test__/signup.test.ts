import request from 'supertest';
import { app } from '../../../app';

it('should successfully signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'testUser@mail.com', password: 'password' })
    .expect(201);
});

it('returns 422 when an invalid email is provided', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'testUser', password: 'password' })
    .expect(400);
});
it('returns 422 when an invalid password is provided', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'testUser@mail.com', password: 'pa' })
    .expect(400);
});
it('returns 422 when an both email and password is not provided', async () => {
  return request(app).post('/api/users/signup').send({}).expect(400);
});

it('disallows existing email address from signing up', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'testUser@mail.com', password: 'password' })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({ email: 'testUser@mail.com', password: 'password' })
    .expect(422);
});

it('sets cookie after a successfully signip', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email: 'testUser@mail.com', password: 'password' })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
