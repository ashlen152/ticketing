import { OrderCancelledEvent, Publisher, Subjects } from "@tpthinh/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
