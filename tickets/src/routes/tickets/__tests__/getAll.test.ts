import request from 'supertest';
import { app } from '../../../app';

const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({ title: 'test title', price: 20 });
};

it('should get all tickets created', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get('/api/tickets').send().expect(200);
  expect(response.body.data.length).toEqual(3);
});
