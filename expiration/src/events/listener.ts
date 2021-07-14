import { Listener, OrderCreatedEvent, Subjects } from '@tunedev_tickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queueGroupName';
import { expirationQueue } from '../queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Job delay in milliseconds ->', delay);

    await expirationQueue.add({ orderId: data.id }, { delay });

    msg.ack();
  }
}
