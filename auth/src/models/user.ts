import mongoose from "mongoose";
import { Password } from "../services/password";

interface IUserAttrs {
  email: string;
  password: string;
}

interface IUserModel extends mongoose.Model<IUserDoc> {
  build(attrs: IUserAttrs): IUserDoc;
}

interface IUserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  const fieldPassword = "password";
  if (this.isModified(fieldPassword)) {
    const hashed = await Password.toHash(this.get(fieldPassword));
    this.set(fieldPassword, hashed);
  }
  done();
});

userSchema.statics.build = (user: IUserAttrs) => new User(user);

const User = mongoose.model<IUserDoc, IUserModel>("User", userSchema);

export { User };
