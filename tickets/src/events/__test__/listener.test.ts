import { Message } from 'node-nats-streaming';
import { OrderCreatedListener, OrderCancelledListener } from '../listeners';
import {
  OrderCreatedEvent,
  OrderStatus,
  OrderCancelledEvent,
  Subjects,
} from '@tunedev_tickets/common';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket, TicketDocs } from '../../model';

const seedTicket: () => Promise<TicketDocs> = async () => {
  const ticket = Ticket.build({
    title: 'test ticket',
    price: '40',
    userId: global.generateRandomId(),
  });
  await ticket.save();

  return ticket;
};

// create a orderCreatedListenerSetup function
const orderCreatedListenerSetup = async (customTicket?: TicketDocs) => {
  // create a new listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create a seed ticket
  const ticket = customTicket || (await seedTicket());

  // create a fake eventData
  const eventData: OrderCreatedEvent['data'] = {
    id: global.generateRandomId(),
    version: 0,
    status: OrderStatus.Created,
    userId: global.generateRandomId(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    ticket: {
      id: ticket.id,
      price: parseFloat(ticket.price),
    },
  };

  // create a message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, eventData, msg };
};

// create a orderCancelledListenerSetup function
const orderCancelledListenerSetup = async (ticketId: string) => {
  // create a new listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create a fake eventData
  const eventData: OrderCancelledEvent['data'] = {
    id: global.generateRandomId(),
    version: 1,
    userId: global.generateRandomId(),
    ticket: {
      id: ticketId,
    },
  };
  // create a message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, eventData, msg };
};

it('should successfully reserve a ticket', async () => {
  const { listener, ticket, eventData, msg } =
    await orderCreatedListenerSetup();

  await listener.onMessage(eventData, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toBe(eventData.id);
});

it('acks event after processing', async () => {
  const { listener, eventData, msg } = await orderCreatedListenerSetup();

  await listener.onMessage(eventData, msg);

  expect(msg.ack).toBeCalled();
});

it('should publish a ticket:update event after successfully reserving a ticket', async () => {
  const { listener, eventData, msg } = await orderCreatedListenerSetup();

  await listener.onMessage(eventData, msg);

  const ticket = await Ticket.findById(eventData.ticket.id);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(
    JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).id
  ).toEqual(ticket!.id);
  expect(
    JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).price
  ).toEqual(parseFloat(ticket!.price));
  expect(
    JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).title
  ).toEqual(ticket!.title);
  expect(
    JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
      .orderId
  ).toEqual(ticket!.orderId);
});

it('should successfully unreserve a ticket', async () => {
  // Reserve a ticket with event listener
  const seedTicketData = await seedTicket();
  const {
    listener: creatListener,
    eventData: createEventData,
    msg: createMsg,
  } = await orderCreatedListenerSetup(seedTicketData);
  await creatListener.onMessage(createEventData, createMsg);

  const { listener, eventData, msg } = await orderCancelledListenerSetup(
    seedTicketData.id
  );

  await listener.onMessage(eventData, msg);

  const updatedTicket = await Ticket.findById(seedTicketData.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acks OrderCancelled Event after processing', async () => {
  const seedTicketData = await seedTicket();
  const { listener, eventData, msg } = await orderCancelledListenerSetup(
    seedTicketData.id
  );

  await listener.onMessage(eventData, msg);

  expect(msg.ack).toBeCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
