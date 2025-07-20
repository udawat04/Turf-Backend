const Turf = require("../Model/TurfModel")

exports.addTurf = async(req,res)=>{
    const {turfName , city , location ,price}= req.body
    const data = req.body
    const newTurf = new Turf(data)
    await newTurf.save()

    return res.status(200).json({message:"Turf added ",newTurf})
}

exports.getTurf = async (req, res) => {
 const response = await Turf.find()
 console.log(response,"kkkk")
 
  return res.status(200).json({ message: "All turf fetched ", response });
};