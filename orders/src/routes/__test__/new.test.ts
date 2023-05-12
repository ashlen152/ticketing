import request from "supertest";
import app from "../../app";
import { natsWrapper } from "../../nats-wrapper";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/order";
import { OrderStatus } from "@tpthinh/common";

const apiOrdersUrl = "/api/orders";

it("has a router handler listening to /api/orders for post requests", async () => {
  const response = await request(app).post(apiOrdersUrl).send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  await request(app).post(apiOrdersUrl).send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("return an error if the ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();

  const response = await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", global.signin())
    .send({ ticketId });

  expect(response.status).toEqual(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "test",
    price: 10,
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: "test",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  const response = await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id });

  expect(response.status).toEqual(400);
});

it("Reserved a ticket", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "test",
    price: 10,
  });
  await ticket.save();

  const response = await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id });

  expect(response.status).toEqual(201);
});

it("emit an order created event", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "test",
    price: 10,
  });
  await ticket.save();

  await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
