import request from 'supertest';
import { app } from '../../../app';
import { Order, OrderStatus } from '../../../models';
import { natsWrapper } from '../../../nats-wrapper';

it('should return 401 for user that has not signed in', async () => {
  const randomId = global.generateRandomId();
  await request(app).delete(`/api/orders/${randomId}`).send().expect(401);
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
    .delete(`/api/orders/${orderDetails.body.data.id}`)
    .set('Cookie', global.getCookie())
    .send()
    .expect(401);
});

it('successfully cancels a ticket', async () => {
  const existingTicket = await global.seedTicket();
  const userCookie = await global.getCookie();

  const orderDetails = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: existingTicket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${orderDetails.body.data.id}`)
    .set('Cookie', userCookie)
    .send()
    .expect(204);

  const cancelledOrder = await Order.findById(orderDetails.body.data.id);

  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Should pubish an event for Order:Cancelled', async () => {
  const existingTicket = await global.seedTicket();
  const userCookie = await global.getCookie();

  const orderDetails = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: existingTicket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${orderDetails.body.data.id}`)
    .set('Cookie', userCookie)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
