import { Message } from 'node-nats-streaming';
import {
  ExpirationCompleteEvent,
  OrderStatus,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from '@tunedev_tickets/common';
import {
  TicketCreatedListener,
  TicketUpdatedListener,
  ExpirationCompleteListener,
} from '../listener';
import { natsWrapper } from '../../nats-wrapper';
import { Order, Ticket } from '../../models';

describe('TicketCreatedListeners', () => {
  // abstract the first three comments in a function called setup
  const setup = async () => {
    // create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);
    // create a fake data event
    const eventData: TicketCreatedEvent['data'] = {
      version: 0,
      id: global.generateRandomId(),
      title: 'from test listener',
      price: 120,
      userId: global.generateRandomId(),
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, eventData, msg };
  };

  it('creates and saves a ticket', async () => {
    const { listener, eventData, msg } = await setup();
    // all the onMessage method with the data object + the Message object
    await listener.onMessage(eventData, msg);
    // write assertions to make sure a ticket was created
    const ticket = await Ticket.findById(eventData.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toBe(eventData.title);
    expect(ticket!.price).toBe(eventData.price);
  });

  it('acks the message', async () => {
    const { listener, eventData, msg } = await setup();
    // all the onMessage method with the data object + the Message object
    await listener.onMessage(eventData, msg);

    // write assertions to make sure ack is called
    expect(msg.ack).toHaveBeenCalled();
  });
});

describe('TicketUpdatedListeners', () => {
  const setup = async () => {
    // create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = await global.seedTicket();

    // create a fake data event
    const eventData: TicketUpdatedEvent['data'] = {
      id: ticket.id,
      version: 1,
      title: 'from test listener',
      price: 120,
      userId: global.generateRandomId(),
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, eventData, msg };
  };

  it('updates a ticket', async () => {
    const { listener, eventData, msg } = await setup();
    // all the onMessage method with the data object + the Message object
    await listener.onMessage(eventData, msg);
    // write assertions to make sure a ticket was updated
    const ticket = await Ticket.findById(eventData.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toBe(eventData.title);
    expect(ticket!.price).toBe(eventData.price);
  });

  it('acks the message', async () => {
    const { listener, eventData, msg } = await setup();
    // all the onMessage method with the data object + the Message object
    await listener.onMessage(eventData, msg);

    // write assertions to make sure ack is called
    expect(msg.ack).toHaveBeenCalled();
  });

  it('does not update a ticket if the version is out of order', async () => {
    const { listener, eventData, msg } = await setup();

    eventData.version = 10;

    try {
      await listener.onMessage(eventData, msg);
    } catch (e) {
      expect(e.message).toBe('Ticket not found');
    }

    expect(msg.ack).not.toHaveBeenCalled();
  });
});

describe('ExpirationCancelledListener', () => {
  const setup = async (customStatus?: OrderStatus) => {
    // create an instance of the listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = await global.seedTicket();

    const order = Order.build({
      userId: global.generateRandomId(),
      status: customStatus || OrderStatus.Created,
      expiresAt: new Date(),
      ticket: ticket,
    });

    await order.save();

    // create a fake data event
    const eventData: ExpirationCompleteEvent['data'] = {
      orderId: order.id,
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, eventData, msg };
  };

  it('should cancel an order after expirationComplete', async () => {
    const { listener, eventData, msg } = await setup();
    // all the onMessage method with the data object + the Message object
    await listener.onMessage(eventData, msg);
    // write assertions to make sure a ticket was updated
    const order = await Order.findById(eventData.orderId);

    expect(order!.status).toBe(OrderStatus.Cancelled);
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it('should not cancel an order with status other than created', async () => {
    const { listener, eventData, msg } = await setup(OrderStatus.Complete);
    // all the onMessage method with the data object + the Message object
    await listener.onMessage(eventData, msg);
    // write assertions to make sure a ticket was updated
    const order = await Order.findById(eventData.orderId);

    expect(order!.status).toBe(OrderStatus.Complete);
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).not.toHaveBeenCalled();
  });

  it('should error out when id does not exist', async () => {
    const { listener, eventData, msg } = await setup();

    eventData.orderId = global.generateRandomId();
    // all the onMessage method with the data object + the Message object
    try {
      await listener.onMessage(eventData, msg);
    } catch (err) {}

    // write assertions to make sure ack is called
    expect(msg.ack).not.toHaveBeenCalled();
  });
});
