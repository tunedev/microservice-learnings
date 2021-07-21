import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  TicketCreatedEvent,
  TicketUpdatedEvent,
  OrderStatus,
  ExpirationCompleteEvent,
  PaymentCreatedEvent,
} from '@tunedev_tickets/common';
import { OrderCancelledPublisher } from './publisher';

import { Order, Ticket } from '../models';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;

    try {
      const ticket = Ticket.build({
        id,
        title,
        price,
      });
      await ticket.save();

      msg.ack();
    } catch (err) {
      console.log(`Error occured while processing event ${this.subject}`);
    }
  }
}

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;

  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { title, price } = data;

    try {
      const ticket = await Ticket.findByIdAndPrevVersion(data);

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      ticket.set({ title, price });

      await ticket.save();

      msg.ack();
    } catch (error) {
      console.log(
        `Listener with subject: ${this.subject} with data: ${JSON.stringify(
          data
        )} failed to process because of error -> ${error}`
      );
    }
  }
}

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;

  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const { orderId } = data;

    const orderToBeCanceled = await Order.findById(orderId).populate('tickets');

    if (!orderToBeCanceled) {
      throw new Error('Order not found');
    }

    if (orderToBeCanceled.status === OrderStatus.Complete) {
      return msg.ack();
    }

    try {
      orderToBeCanceled.set({ status: OrderStatus.Cancelled });
      await orderToBeCanceled.save();

      const { id, version, userId, ticket } = orderToBeCanceled;
      await new OrderCancelledPublisher(this.client).publish({
        id,
        version,
        userId,
        ticket: {
          id: ticket.id,
        },
      });

      msg.ack();
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export class PaymentCompletedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();

    msg.ack();
  }
}
