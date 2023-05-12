import { ExpirationCompleteEvent, Publisher, Subjects } from "@tpthinh/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
