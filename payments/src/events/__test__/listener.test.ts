import { natsWrapper } from '../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { OrderCreatedListener, OrderCancelledListener } from '../listener';
import {
  OrderCreatedEvent,
  OrderCancelledEvent,
  OrderStatus,
} from '@tunedev_tickets/common';
import { Order } from '../../model';

describe('OrderCreatedListener', () => {
  const setup = async (orderId?: string) => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const eventData: OrderCreatedEvent['data'] = {
      id: orderId || global.generateRandomId(),
      userId: global.generateRandomId(),
      version: 0,
      status: OrderStatus.Created,
      expiresAt: new Date().toISOString(),
      ticket: {
        id: global.generateRandomId(),
        price: 50,
      },
    };

    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, eventData, msg };
  };

  it('should create an OrderCreatedListener', async () => {
    const { listener, msg, eventData } = await setup();

    await listener.onMessage(eventData, msg);

    const order = await Order.findById(eventData.id);

    expect(order).toBeDefined();
    expect(order!.userId).toBe(eventData.userId);
    expect(order!.status).toBe(eventData.status);
    expect(order!.price).toBe(eventData.ticket.price);

    expect(msg.ack).toHaveBeenCalledTimes(1);
  });

  it('it should fail gracefully upon duplicate order creation', async () => {
    const seedOrder = await global.seedOrder();
    const { listener, msg, eventData } = await setup(seedOrder.id);

    await listener.onMessage(eventData, msg);
    expect(msg.ack).toHaveBeenCalledTimes(1);
  });
});

describe('OrderCancelledEvent', () => {
  const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const seedOrder = await global.seedOrder();

    const eventData: OrderCancelledEvent['data'] = {
      id: seedOrder.id,
      userId: seedOrder.userId,
      version: 1,
      ticket: {
        id: global.generateRandomId(),
      },
    };

    // @ts-ignore
    const msg: Message = {
      ack: jest.fn(),
    };

    return { listener, eventData, msg };
  };

  it('should process an order created event successfully', async () => {
    const { listener, msg, eventData } = await setup();

    await listener.onMessage(eventData, msg);

    const order = await Order.findById(eventData.id);

    expect(order).toBeDefined();
    expect(order!.userId).toBe(eventData.userId);
    expect(order!.status).toBe(OrderStatus.Cancelled);

    expect(msg.ack).toHaveBeenCalledTimes(1);
  });
});
