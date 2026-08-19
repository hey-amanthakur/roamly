import mongoose, { Schema, Model } from "mongoose";
import { INewsletterDocument } from "../types";

const NewsletterSchema = new Schema<INewsletterDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Newsletter: Model<INewsletterDocument> = mongoose.model<INewsletterDocument>("Newsletter", NewsletterSchema);
export default Newsletter;
