const mongoose = require("mongoose")


const TurfCitySchema = new mongoose.Schema({
    city:{type:String}
})

const City = mongoose.model("city",TurfCitySchema)
module.exports = City