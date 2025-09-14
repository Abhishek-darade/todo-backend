require("dotenv").config(); // ✅ .env import
const mongoose = require("mongoose");
const Todo = require("./models/Todo"); // relative path तपास

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

// ✅ Get all todos from MongoDB
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find(); // MongoDB मधून सर्व todos मिळवा
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create a new todo
app.post("/todos", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const newTodo = new Todo({ title }); // completed default false
    const savedTodo = await newTodo.save(); // MongoDB मध्ये save करा
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update a todo
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  // 👉 Validate ObjectId (fix for "Cast to ObjectId failed" error)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid todo ID" });
  }

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { $set: { ...(title && { title }), ...(completed !== undefined && { completed }) } },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) return res.status(404).json({ error: "Todo not found" });

    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete a todo
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;

  // 👉 Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid todo ID" });
  }

  try {
    const deletedTodo = await Todo.findByIdAndDelete(id);
    if (!deletedTodo) return res.status(404).json({ error: "Todo not found" });

    res.json(deletedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Port from .env (fallback 3001)
const PORT = process.env.PORT || 3001;

// ✅ Debug: print env to check
console.log("👉 MONGO_URI from .env:", process.env.MONGO_URI);

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
