import {
  Publisher,
  PaymentCreatedEvent,
  Subjects,
} from '@tunedev_tickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
