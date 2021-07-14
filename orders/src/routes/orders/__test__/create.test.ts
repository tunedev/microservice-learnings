import request from 'supertest';
import { Order } from '../../../models';
import { app } from '../../../app';
import { natsWrapper } from '../../../nats-wrapper';

it('should not not return with a 404, route not found error', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send();

  expect(response.status).not.toEqual(404);
});

it('should not return a 401 for an unauthorized request', async () => {
  await request(app).post('/api/orders').send().expect(401);
});

it('should return a 400 for invalid request body', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send()
    .expect(400);
});

it('should return a 404 for a non exiting ticket', async () => {
  const randomId = global.generateRandomId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: randomId })
    .expect(404);
});

it('should create an order on a ticket successfully', async () => {
  const existingOrderB4Op = await Order.find({});

  expect(existingOrderB4Op).toHaveLength(0);
  const seedTicket = await global.seedTicket();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: seedTicket.id })
    .expect(201);

  const orderAfterOp = await Order.find({});

  expect(orderAfterOp).toHaveLength(1);
});

it('should reject an order on an already reserved ticket', async () => {
  const seedTicket = await global.seedTicket();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: seedTicket.id })
    .expect(201);

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: seedTicket.id })
    .expect(422);
});

it('Publish an event when an order is created', async () => {
  const existingOrderB4Op = await Order.find({});

  expect(existingOrderB4Op).toHaveLength(0);
  const seedTicket = await global.seedTicket();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: seedTicket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
