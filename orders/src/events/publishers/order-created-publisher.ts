import { OrderCreatedEvent, Publisher, Subjects } from "@tpthinh/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
