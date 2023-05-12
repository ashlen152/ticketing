import mongoose from "mongoose";

interface IPayment {
  orderId: string;
  stripeId: string;
}

interface IPaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

interface IPaymentModel extends mongoose.Model<IPayment, {}, IPaymentDoc> {
  build(attrs: IPayment): IPaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      required: true,
      type: String,
    },
    stripeId: {
      required: true,
      type: String,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

paymentSchema.statics.build = (attrs: IPayment) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<IPaymentDoc, IPaymentModel>(
  "Payment",
  paymentSchema
);
export { Payment };
