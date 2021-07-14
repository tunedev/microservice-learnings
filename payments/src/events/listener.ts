import {
  Listener,
  OrderCreatedEvent,
  Subjects,
  OrderStatus,
  OrderCancelledEvent,
} from '@tunedev_tickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../model';

import { queueGroupName } from './queueGroupName';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const duplicateOrder = await Order.findById(data.id);

    if (duplicateOrder) {
      console.log('Duplicate order being created');
      msg.ack();
      return;
    }
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      userId: data.userId,
      status: OrderStatus.Created,
      version: data.version,
    });
    await order.save();

    msg.ack();
  }
}

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findByIdAndPrevVersion(data);

    if (!order) {
      throw new Error(`Order with id ${data.id} not found`);
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    msg.ack();
  }
}
