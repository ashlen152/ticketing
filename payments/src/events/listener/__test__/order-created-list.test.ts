import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { OrderCreatedEvent, OrderStatus } from "@tpthinh/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "userA",
    expiresAt: "asd",
    ticket: {
      id: "test",
      price: 10,
    },
  };

  const msg: Partial<Message> = {
    ack: jest.fn(),
  };

  return { data, msg, listener };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);

  const updatedTicket = await Order.findById(data.id);

  expect(updatedTicket!.id).toEqual(data.id);
  expect(updatedTicket!.price).toEqual(data.ticket.price);
  expect(updatedTicket!.userId).toEqual(data.userId);
  expect(updatedTicket!.status).toEqual(data.status);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);

  expect(msg.ack).toHaveBeenCalled();
});
