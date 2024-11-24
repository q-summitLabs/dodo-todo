import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for this task."],
      maxlength: [60, "Title cannot be more than 60 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, collection: "tasks" } // This sets the collection name}
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
