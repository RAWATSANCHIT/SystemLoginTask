const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

// User Schema

const userSchema = new Schema(
  {
    userId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token:{ type:String }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
const User = mongoose.model("user", userSchema);
module.exports = User;

module.exports.hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10); // 10 rounds
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw new Error("Hashing failed", error);
    }
};



// TASK Schema

const taskSchema = new Schema(
  {
    taskId: { type: String, unique: true, required: true },
    userId: { type: String,},
    title : { type: String, required: true },
    dueDate: { type: String, required: true },
    attachmentFile: { type: String, required: true},
  }
);
const Task = mongoose.model("task", taskSchema);
module.exports = Task;



// Attachment Schema

var imageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});
 
//Image is a model which has a schema imageSchema
 
module.exports = new mongoose.model('Image', imageSchema);