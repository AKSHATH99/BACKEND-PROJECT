import mongoose, { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      //one who is subscribing
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      //one to whom 'subscriber ' is subscribing to
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
