import { OrderStatus } from "@tpthinh/common";
import mongoose, { Model, Schema, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface IOrder {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

export interface IOrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface OrderModel extends Model<IOrder, {}, IOrderDoc> {
  build(attrs: IOrder): IOrderDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<IOrderDoc | null>;
}

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    versionKey: false,
  }
);

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.findByEvent = ({
  id,
  version,
}: {
  id: string;
  version: number;
}) => {
  return Order.findOne({
    _id: id,
    version: version - 1,
  });
};

orderSchema.statics.build = (attr: IOrder) => {
  return new Order({
    _id: attr.id,
    userId: attr.userId,
    status: attr.status,
    price: attr.price,
  });
};

const Order = model<IOrderDoc, OrderModel>("Order", orderSchema);

export { Order };
