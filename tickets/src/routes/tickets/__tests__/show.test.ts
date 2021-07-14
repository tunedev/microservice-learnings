import request from 'supertest';
import { app } from '../../../app';

it('should return 404, when trying to get a ticket', async () => {
  const randomId = global.generateRandomId();
  await request(app).get(`/api/tickets/${randomId}`).send().expect(404);
});

it('should get an existing ticket with similar details', async () => {
  const testTicket = { title: 'test ticket', price: '100' };
  const existingTicketRes = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send(testTicket)
    .expect(201);

  const response = await request(app)
    .get(`/api/tickets/${existingTicketRes.body.data.id}`)
    .send()
    .expect(200);

  expect(response.body.data.title).toEqual(testTicket.title);
  expect(response.body.data.price).toEqual(testTicket.price);
});
