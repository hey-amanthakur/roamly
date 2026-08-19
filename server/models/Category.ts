import mongoose, { Schema, Model } from "mongoose";
import { ICategoryDocument } from "../types";

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Category: Model<ICategoryDocument> = mongoose.model<ICategoryDocument>("Category", CategorySchema);
export default Category;
