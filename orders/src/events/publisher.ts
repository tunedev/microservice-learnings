import {
  Publisher,
  Subjects,
  OrderCreatedEvent,
  OrderCancelledEvent,
} from '@tunedev_tickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
