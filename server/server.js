require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Employee = require("./Employee");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err.message));

// GET all employees
app.get("/api/employees", async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  res.json(employees);
});

// ADD employee
app.post("/api/employees", async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ message: Object.values(err.errors || {})[0]?.message || err.message });
  }
});

// UPDATE employee
app.put("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: Object.values(err.errors || {})[0]?.message || err.message });
  }
});

// DELETE employee
app.delete("/api/employees/:id", async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on http://localhost:${process.env.PORT}`)
);