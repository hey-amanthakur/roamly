import mongoose, { Schema, Model } from "mongoose";
import { IReportDocument } from "../types";

const ReportSchema = new Schema<IReportDocument>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reporterUsername: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["post", "comment", "user"],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ["spam", "inappropriate", "harassment", "false-information", "copyright", "other"],
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Report: Model<IReportDocument> = mongoose.model<IReportDocument>("Report", ReportSchema);
export default Report;
