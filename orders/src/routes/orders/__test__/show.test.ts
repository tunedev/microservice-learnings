import request from 'supertest';
import { app } from '../../../app';

it('should return 401 for user that has not signed in', async () => {
  const randomId = global.generateRandomId();
  await request(app).get(`/api/orders/${randomId}`).send().expect(401);
});

it('should return 401 for user accessing order that is not theirs', async () => {
  const existingTicket = await global.seedTicket();
  const userCookie = await global.getCookie();

  const orderDetails = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: existingTicket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${orderDetails.body.data.id}`)
    .set('Cookie', global.getCookie())
    .send()
    .expect(401);
});

it('should fetch a single order', async () => {
  const existingTicket = await global.seedTicket();
  const userCookie = await global.getCookie();

  const orderDetails = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: existingTicket.id })
    .expect(201);

  const response = await request(app)
    .get(`/api/orders/${orderDetails.body.data.id}`)
    .set('Cookie', userCookie)
    .send()
    .expect(200);

  expect(response.body.data.id).toEqual(orderDetails.body.data.id);
  expect(response.body.data.ticket.id).toEqual(existingTicket.id);
});
