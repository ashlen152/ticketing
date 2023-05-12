import { Publisher, Subjects, TicketCreatedEvent } from "@tpthinh/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
