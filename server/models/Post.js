const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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

const PostSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model("Post", PostSchema);
