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

it("has a router handler listening to /api/orders/:id for get requests", async () => {
  const orderId = new mongoose.Types.ObjectId();
  const response = await request(app)
    .get(`${apiOrdersUrl}/${orderId}`)
    .send({});

  expect(response.status).not.toEqual(200);
});

it("can only be accessed if the user is signed in", async () => {
  const orderId = new mongoose.Types.ObjectId();
  await request(app).get(`${apiOrdersUrl}/${orderId}`).send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const orderId = new mongoose.Types.ObjectId();
  const response = await request(app)
    .get(`${apiOrdersUrl}/${orderId}`)
    .set("Cookie", global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("fetches orders", async () => {
  const ticket = await buildTicket();

  const user = global.signin();

  const { body: order } = await request(app)
    .post(apiOrdersUrl)
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const response = await request(app)
    .get(`${apiOrdersUrl}/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(response.body.id).toEqual(order.id);
});

it("return 404 if the fetches orders not existing", async () => {
  const orderId = new mongoose.Types.ObjectId();

  const user = global.signin();

  await request(app)
    .delete(`${apiOrdersUrl}/${orderId}`)
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
    .delete(`${apiOrdersUrl}/${order.id}`)
    .set("Cookie", userTwo)
    .send()
    .expect(401);
});
