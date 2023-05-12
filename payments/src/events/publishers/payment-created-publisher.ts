import { PaymentCreatedEvent, Publisher, Subjects } from "@tpthinh/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
