const mongoose = require("mongoose")


const TurfCitySchema = new mongoose.Schema({
    city:{type:String},
    image: { type: String, default: "" }, // City image URL
}, { timestamps: true })

const City = mongoose.model("city",TurfCitySchema)
module.exports = City