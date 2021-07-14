import request from 'supertest';
import { app } from '../../../app';

it('should return 422 for credentials that does not exist', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({ email: 'NotExist@mail.com', password: 'password' })
    .expect(422);
});

it('should return 422 when wrong password is provided', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'testuser@mail.com', password: 'password' })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({ email: 'testuser@mail.com', password: 'passw' })
    .expect(422);

  expect(response.body.errors[0].message).toEqual('Invalid Credentials');
});

it('should sets cookies upon successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'testuser@mail.com', password: 'password' })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({ email: 'testuser@mail.com', password: 'password' })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
