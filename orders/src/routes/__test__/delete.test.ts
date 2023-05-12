import request from "supertest";
import app from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";
import { OrderStatus } from "@tpthinh/common";
import { natsWrapper } from "../../nats-wrapper";

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

it("has a router handler listening to /api/orders/:id for delete requests", async () => {
  const orderId = new mongoose.Types.ObjectId();
  const response = await request(app)
    .delete(`${apiOrdersUrl}/${orderId}`)
    .send({});

  expect(response.status).not.toEqual(200);
});

it("can only be accessed if the user is signed in", async () => {
  const orderId = new mongoose.Types.ObjectId();
  await request(app).delete(`${apiOrdersUrl}/${orderId}`).send({}).expect(401);
});

it("return 204 when the order marks as cancelled", async () => {
  const ticket = await buildTicket();

  const user = global.signin();

  const { body: order } = await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`${apiOrdersUrl}/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  const response = await request(app)
    .get(`${apiOrdersUrl}/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(response.body.status).toEqual(OrderStatus.Cancelled);
});

it("return 404 if the fetches orders not existing", async () => {
  const orderId = new mongoose.Types.ObjectId();

  const user = global.signin();

  await request(app)
    .get(`${apiOrdersUrl}/${orderId}`)
    .set("Cookie", user)
    .send()
    .expect(404);
});

it("returns a 401 if the fetches order not belong to the user logged", async () => {
  const ticket = await buildTicket();

  const userOne = global.signin();
  const userTwo = global.signin();

  const { body: order } = await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`${apiOrdersUrl}/${order.id}`)
    .set("Cookie", userTwo)
    .send()
    .expect(401);
});

it("emit an order cancelled event", async () => {
  const ticket = await buildTicket();

  const user = global.signin();

  const { body: order } = await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`${apiOrdersUrl}/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
