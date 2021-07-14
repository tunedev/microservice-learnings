import request from 'supertest';
import { app } from '../../../app';
import { Ticket } from '../../../model';
import { natsWrapper } from '../../../nats-wrapper';

it('should not return 404', async () => {
  const randomId = global.generateRandomId();
  const response = await request(app)
    .patch(`/api/tickets/${randomId}`)
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed by a signed in user', async () => {
  const randomId = global.generateRandomId();
  await request(app).patch(`/api/tickets/${randomId}`).send({}).expect(401);
});

it('should return 404 for a ticket that does not exist', async () => {
  const randomId = global.generateRandomId();
  const response = await request(app)
    .patch(`/api/tickets/${randomId}`)
    .set('Cookie', global.getCookie())
    .send({});

  expect(response.status).toEqual(404);
});

it('should not return a 401 for a signed in user', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('should return bad request when provided input violates schema', async () => {
  const existingTicketRes = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({ title: 'test ticket', price: 20 })
    .expect(201);

  const responseForInvalidTitle = await request(app)
    .patch(`/api/tickets/${existingTicketRes.body.data.id}`)
    .set('Cookie', global.getCookie())
    .send({ title: '' })
    .expect(400);

  expect(responseForInvalidTitle.body.errors.length).toEqual(1);
  expect(responseForInvalidTitle.body.errors[0].message).toBeDefined();
  expect(responseForInvalidTitle.body.errors[0].message).toEqual(
    'Title cannot be empty'
  );
  const responseForInvalidPrice = await request(app)
    .patch(`/api/tickets/${existingTicketRes.body.data.id}`)
    .set('Cookie', global.getCookie())
    .send({ price: -12 })
    .expect(400);

  expect(responseForInvalidPrice.body.errors.length).toEqual(1);
  expect(responseForInvalidPrice.body.errors[0].message).toBeDefined();
  expect(responseForInvalidPrice.body.errors[0].message).toEqual(
    'Price cannot be less than Zero'
  );
});

it('should throw an unauthorized error if userId trying to update is not the same as user id that created ticket', async () => {
  const testTicket = { title: 'test ticket', price: '20' };
  const newTicket = { title: 'new ticket title' };
  const randomUserId = global.generateRandomId();
  const existingTicketRes = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send(testTicket)
    .expect(201);

  await request(app)
    .patch(`/api/tickets/${existingTicketRes.body.data.id}`)
    .set('Cookie', global.getCookie(randomUserId))
    .send({ title: newTicket.title })
    .expect(401);
});

it('should update ticket title with provided id successfully', async () => {
  const testTicket = { title: 'test ticket', price: '20' };
  const newTicket = { title: 'new ticket title' };
  const randomUserId = global.generateRandomId();
  const existingTicketRes = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie(randomUserId))
    .send(testTicket)
    .expect(201);

  await request(app)
    .patch(`/api/tickets/${existingTicketRes.body.data.id}`)
    .set('Cookie', global.getCookie(randomUserId))
    .send({ title: newTicket.title })
    .expect(200);

  const responseForValidTitle = await request(app)
    .get(`/api/tickets/${existingTicketRes.body.data.id}`)
    .send()
    .expect(200);

  expect(responseForValidTitle.body.data.title).not.toEqual(testTicket.title);
  expect(responseForValidTitle.body.data.title).toEqual(newTicket.title);
});

it('should update ticket price with provided id successfully', async () => {
  const testTicket = { title: 'test ticket', price: '20' };
  const newTicket = { price: '50' };
  const randomUserId = global.generateRandomId();
  const existingTicketRes = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie(randomUserId))
    .send(testTicket)
    .expect(201);

  await request(app)
    .patch(`/api/tickets/${existingTicketRes.body.data.id}`)
    .set('Cookie', global.getCookie(randomUserId))
    .send({ price: newTicket.price })
    .expect(200);

  const responseForValidPrice = await request(app)
    .get(`/api/tickets/${existingTicketRes.body.data.id}`)
    .send()
    .expect(200);

  expect(responseForValidPrice.body.data.price).not.toEqual(testTicket.price);
  expect(responseForValidPrice.body.data.price).toEqual(newTicket.price);
});

it('should publish an event on ticket update', async () => {
  const testTicket = { title: 'test ticket', price: '20' };
  const newTicket = { price: '50' };
  const randomUserId = global.generateRandomId();
  const existingTicketRes = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie(randomUserId))
    .send(testTicket)
    .expect(201);

  await request(app)
    .patch(`/api/tickets/${existingTicketRes.body.data.id}`)
    .set('Cookie', global.getCookie(randomUserId))
    .send({ price: newTicket.price })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('should return a 422 for editing a ticket that has been reserved', async () => {
  const testTicket = { title: 'test ticket', price: '20' };
  const newTicket = { price: '50' };
  const randomUserId = global.generateRandomId();
  const existingTicketRes = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie(randomUserId))
    .send(testTicket)
    .expect(201);

  const existingTicket = await Ticket.findById(existingTicketRes.body.data.id);
  existingTicket!.set({ orderId: global.generateRandomId() });
  existingTicket!.save();

  await request(app)
    .patch(`/api/tickets/${existingTicketRes.body.data.id}`)
    .set('Cookie', global.getCookie(randomUserId))
    .send({ price: newTicket.price })
    .expect(422);
});
