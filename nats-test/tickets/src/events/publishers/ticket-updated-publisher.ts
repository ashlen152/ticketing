import { Publisher, Subjects, TicketUpdatedEvent } from "@tpthinh/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
