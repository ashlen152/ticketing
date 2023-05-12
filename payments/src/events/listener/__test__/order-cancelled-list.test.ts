import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { OrderCancelledEvent, OrderStatus } from "@tpthinh/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "user",
    price: 10,
  });

  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: "test",
    },
  };

  const msg: Partial<Message> = {
    ack: jest.fn(),
  };

  return { order, data, msg, listener };
};

it("Update status of order to cancelled", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);

  const updatedTicket = await Order.findById(data.id);

  expect(updatedTicket!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);

  expect(msg.ack).toHaveBeenCalled();
});
