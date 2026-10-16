const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      match: [/^[A-Za-z ]+$/, "Name must contain only characters, no numbers"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      match: [/^\d{10}$/, "Phone must contain only numbers (exactly 10 digits)"],
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [1, "Salary must be greater than 0"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      match: [/^[A-Za-z ]+$/, "Designation must contain only characters, no numbers"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);