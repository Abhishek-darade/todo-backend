const mongoose = require("mongoose");

// 1️⃣ Define schema
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

// 2️⃣ Make model & export it
module.exports = mongoose.model("Todo", todoSchema);
