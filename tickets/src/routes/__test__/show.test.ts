import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";

const apiTickets = "/api/tickets";

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`${apiTickets}/${id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const title = "test1";
  const price = 20;
  const response = await request(app)
    .post(apiTickets)
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`${apiTickets}/${response.body.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
