import request from 'supertest';
import { OrderStatus } from '@tunedev_tickets/common';
import { Payment } from '../../../model';

import { app } from '../../../app';
import { stripe } from '../../../stripe';
import { natsWrapper } from '../../../nats-wrapper';
jest.mock('../../../stripe');

it('does not return a 404, for route payments', async () => {
  const res = await request(app).post('/api/payments').send();
  expect(res.status).not.toBe(404);
});

it('returns a 401 for request with no token', async () => {
  await request(app).post('/api/payments').send().expect(401);
});

it('should return 400 for a bad request payload', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({})
    .expect(400);
});

it('should return a 404 for an orderId that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({ token: 'randomToken', orderId: global.generateRandomId() })
    .expect(404);
});
it('should return a 401 for order that is not for the signed in user', async () => {
  const seedOrder = await global.seedOrder();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({ token: 'randomToken', orderId: seedOrder.id })
    .expect(401);
});

it('should return a 422 for a cancelled order', async () => {
  const seedOrder = await global.seedOrder();
  seedOrder.set({ status: OrderStatus.Cancelled });
  await seedOrder.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(seedOrder.userId))
    .send({ token: 'randomToken', orderId: seedOrder.id })
    .expect(422);
});

it('should call the charge funtions successfully', async () => {
  const seedOrder = await global.seedOrder();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(seedOrder.userId))
    .send({ token: 'randomToken', orderId: seedOrder.id })
    .expect(201);

  const paymentDetails = await Payment.findOne({ orderId: seedOrder.id });

  expect(stripe.charges.create).toHaveBeenCalledTimes(1);
  expect(paymentDetails).not.toBeNull();
  expect(paymentDetails!.stripeId).toBe('paymentTestID');
});

it('should call publish the event', async () => {
  const seedOrder = await global.seedOrder();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(seedOrder.userId))
    .send({ token: 'randomToken', orderId: seedOrder.id })
    .expect(201);

  expect(natsWrapper.client.publish).toBeCalled();
});
