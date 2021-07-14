import request from 'supertest';
import { app } from '../../../app';
import { Ticket } from '../../../model';
import { natsWrapper } from '../../../nats-wrapper';

it('should not return 404', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed by a signed in user', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});
it('should not return a 401 for a signed in user', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({});

  expect(response.status).not.toEqual(401);
});
it('is should return invalid title provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      price: 100,
      title: '',
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      price: 100,
    })
    .expect(400);
});
it('should return invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      price: -100,
      title: 'test ticket',
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      title: 'test ticket',
    })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  const testTicket = { title: 'test ticket', price: '20' };
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send(testTicket)
    .expect(201);

  // check that the above request creates the ticket in db
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(testTicket.price);
  expect(tickets[0].title).toEqual(testTicket.title);
});

it('should publish an event', async () => {
  const testTicket = { title: 'test ticket', price: '20' };
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send(testTicket)
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
