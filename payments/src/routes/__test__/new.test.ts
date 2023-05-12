import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@tpthinh/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";
import { natsWrapper } from "../../nats-wrapper";

const url = "/api/payments";

it("returns 404 when purchasing an order that does not exists", async () => {
  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      token: "asdbc",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns a 401 when purchasing an order that doesn't belong to the user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    version: 0,
  });

  await order.save();
  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      token: "asdbc",
      orderId: order.id,
    })
    .expect(401);
});

it("returns a 400 when a purchasing a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const token = global.signin(userId);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    userId: userId,
    price: 10,
    version: 0,
  });

  await order.save();
  await request(app)
    .post(url)
    .set("Cookie", token)
    .send({
      token: "asdbc",
      orderId: order.id,
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: userId,
    price,
    version: 0,
  });

  await order.save();
  await request(app)
    .post(url)
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual("usd");

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
