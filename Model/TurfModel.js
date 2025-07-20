// models/Turf.js
const mongoose = require("mongoose");

const TurfSchema = new mongoose.Schema(
  {
    turfName: { type: String, required: true },
    city:{type:String},
    location: { type: String, required: true }, // city name
    price: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("turve", TurfSchema);
