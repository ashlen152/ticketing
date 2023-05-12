import request from "supertest";
import app from "../../app";

const apiTickets = "/api/tickets";

const testTicket = {
  title: "test1",
  price: 10,
};

const createTicket = () => {
  return request(app)
    .post(apiTickets)
    .set("Cookie", global.signin())
    .send(testTicket)
    .expect(201);
};

it("can fetch a list of tickets", async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get(apiTickets).send().expect(200);

  expect(response.body.length).toEqual(3);
});
