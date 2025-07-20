const City =  require("../Model/TurfCityModel")

exports.addCity = async (req, res) => {
	const {city} =req.body

    const data = req.body
    const newCity = new City(data)
    await newCity.save()

    return res.status(200).json({message:"city added successfully ",newCity})

};

exports.getCity = async (req, res) => {
  const response = await City.find()

  return res.status(200).json({ message: "all city get ", response });
};