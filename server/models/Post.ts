import mongoose, { Schema, Model } from "mongoose";
import { IPostDocument, ICommentDocument } from "../types";

const CommentSchema = new Schema<ICommentDocument>(
  {
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const PostSchema = new Schema<IPostDocument>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    photo: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    location: {
      name: { type: String, default: "" },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      country: { type: String, default: "" },
      city: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [CommentSchema],
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

PostSchema.index({ username: 1 });
PostSchema.index({ categories: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ status: 1 });
PostSchema.index({ title: "text", desc: "text", tags: "text" });

const Post: Model<IPostDocument> = mongoose.model<IPostDocument>("Post", PostSchema);
export default Post;
