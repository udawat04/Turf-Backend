const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    password: { type: String },
    otp: { type: String },
    validTime: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("user",userSchema)

module.exports = User