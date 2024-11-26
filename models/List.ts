import mongoose from "mongoose";

const ListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this list."],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, collection: "lists" }
);

export default mongoose.models.List || mongoose.model("List", ListSchema);
