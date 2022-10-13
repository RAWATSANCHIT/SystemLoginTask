const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    title : { type: String, required: true },
    dueDate: { type: String, required: true },
    attachmentFile: { type: String, required: true},
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
const Task = mongoose.model("task", taskSchema);
module.exports = Task;