import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from '@tunedev_tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
