import { Message } from 'node-nats-streaming';
import {
  Subjects,
  OrderCreatedEvent,
  OrderCancelledEvent,
  Listener,
} from '@tunedev_tickets/common';
import { TicketUpdatedPublisher } from './publishers';
import { queueGroupName } from './queueGroupName';
import { Ticket } from '../model';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: data.id });
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: parseFloat(ticket.price),
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: null });
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: parseFloat(ticket.price),
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
