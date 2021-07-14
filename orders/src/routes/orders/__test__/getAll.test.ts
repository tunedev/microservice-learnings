import request from 'supertest';
import { app } from '../../../app';

it('fetches orders for a particular user', async () => {
  // create three tickets
  const ticket1 = await global.seedTicket();
  const ticket2 = await global.seedTicket();
  const ticket3 = await global.seedTicket();

  // Create order request to by user 1 to one of the tickets
  const user1Cookie = await global.getCookie();
  const user2Cookie = await global.getCookie();

  await request(app)
    .post('/api/orders')
    .set('Cookie', user1Cookie)
    .send({ ticketId: ticket1.id })
    .expect(201);

  // Create two orders to two of the tickets for user 2
  await request(app)
    .post('/api/orders')
    .set('Cookie', user2Cookie)
    .send({ ticketId: ticket2.id })
    .expect(201);
  await request(app)
    .post('/api/orders')
    .set('Cookie', user2Cookie)
    .send({ ticketId: ticket3.id })
    .expect(201);

  // Fetch all orders by user to then create your assertion
  const user2Orders = await request(app)
    .get('/api/orders')
    .set('Cookie', user2Cookie)
    .send()
    .expect(200);

  expect(user2Orders.body.data.length).toEqual(2);
});
