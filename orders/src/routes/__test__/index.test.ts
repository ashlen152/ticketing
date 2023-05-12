import request from "supertest";
import app from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

const apiOrdersUrl = "/api/orders";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "test",
    price: 10,
  });

  await ticket.save();
  return ticket;
};

it("has a router handler listening to /api/orders for get requests", async () => {
  const response = await request(app).get(apiOrdersUrl).send({});

  expect(response.status).not.toEqual(200);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).get(apiOrdersUrl).send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .get(apiOrdersUrl)
    .set("Cookie", global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("fetches orders for an particular user", async () => {
  // Create three tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = global.signin();
  const userTwo = global.signin();
  // Create one order as User #1

  await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);
  // Create two order as User #2
  const { body: orderOne } = await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);
  // Make request to get order for User #2

  const response = await request(app)
    .get(apiOrdersUrl)
    .set("Cookie", userTwo)
    .send({})
    .expect(200);
  // Make sure we only got the orders for user #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
});
