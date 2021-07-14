import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from '@tunedev_tickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
