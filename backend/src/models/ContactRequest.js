import mongoose from "mongoose";

const contactRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate requests
contactRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

const ContactRequest = mongoose.model("ContactRequest", contactRequestSchema);

export default ContactRequest;
