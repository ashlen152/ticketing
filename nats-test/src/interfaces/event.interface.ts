import { Subjects } from "../events/subjects";

export interface Event {
  subject: Subjects;
  data: any;
}
