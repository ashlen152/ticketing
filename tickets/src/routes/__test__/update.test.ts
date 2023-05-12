import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

const apiTickets = "/api/tickets";

it("returns a 404 if the provided id doesn't exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`${apiTickets}/${id}`)
    .set("Cookie", signin())
    .send({
      title: "updated",
      price: 1,
    })
    .expect(404);
});

it("return a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`${apiTickets}/${id}`)
    .send({
      title: "updated",
      price: 1,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const responseCreate = await request(app)
    .post(apiTickets)
    .set("Cookie", global.signin())
    .send({
      title: "test1",
      price: 10,
    })
    .expect(201);

  await request(app)
    .put(`${apiTickets}/${responseCreate.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "test2",
      price: 20,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();
  const responseCreate = await request(app)
    .post(apiTickets)
    .set("Cookie", cookie)
    .send({
      title: "test1",
      price: 10,
    })
    .expect(201);

  await request(app)
    .put(`${apiTickets}/${responseCreate.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`${apiTickets}/${responseCreate.body.id}`)
    .set("Cookie", cookie)
    .send({
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`${apiTickets}/${responseCreate.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "test2",
    })
    .expect(400);

  await request(app)
    .put(`${apiTickets}/${responseCreate.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "test2",
      price: "-10",
    })
    .expect(400);
});

it("updates the ticket provided a valid inputs", async () => {
  const cookie = global.signin();
  const responseCreate = await request(app)
    .post(apiTickets)
    .set("Cookie", cookie)
    .send({
      title: "test1",
      price: 10,
    })
    .expect(201);

  await request(app)
    .put(`${apiTickets}/${responseCreate.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "test2",
      price: 10,
    })
    .expect(200);

  const response = await request(app)
    .get(`${apiTickets}/${responseCreate.body.id}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.title).toEqual("test2");
  expect(response.body.price).toEqual(10);
});

it("Should publish an event", async () => {
  const cookie = global.signin();
  const responseCreate = await request(app)
    .post(apiTickets)
    .set("Cookie", cookie)
    .send({
      title: "test1",
      price: 10,
    })
    .expect(201);

  await request(app)
    .put(`${apiTickets}/${responseCreate.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "test2",
      price: 10,
    })
    .expect(200);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("Reject updates if the ticket is reserved", async () => {
  const cookie = global.signin();
  const responseCreate = await request(app)
    .post(apiTickets)
    .set("Cookie", cookie)
    .send({
      title: "test1",
      price: 10,
    })
    .expect(201);

  const ticket = await Ticket.findById(responseCreate.body.id);
  ticket!.set("orderId", new mongoose.Types.ObjectId().toHexString());
  await ticket!.save();

  await request(app)
    .put(`${apiTickets}/${responseCreate.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "test2",
      price: 10,
    })
    .expect(400);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
