const City = require("../Model/TurfCityModel");
const cloudinary = require("../config/cloudinaryConfig");

// Upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'turf-booking/cities',
      use_filename: true
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Create new city (Admin only)
exports.createCity = async (req, res) => {
  try {
    const { city } = req.body;
    
    if (!city) {
      return res.status(400).json({ msg: "City name is required" });
    }

    // Check if city already exists
    const existingCity = await City.findOne({ city: city });
    if (existingCity) {
      return res.status(400).json({ msg: "City already exists" });
    }

    let cityData = { city };
    
    // Handle image upload if file is provided
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file);
      cityData.image = imageUrl;
    }

    const newCity = new City(cityData);
    await newCity.save();

    return res.status(201).json({ 
      msg: "City created successfully", 
      city: newCity 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Get all cities
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find().sort({ city: 1 });
    return res.status(200).json({ 
      msg: "Cities retrieved successfully", 
      cities 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Get city by ID
exports.getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findById(id);
    
    if (!city) {
      return res.status(404).json({ msg: "City not found" });
    }
    
    return res.status(200).json({ city });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Update city (Admin only)
exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { city } = req.body;
    
    let updateData = { city };
    
    // Handle image upload if file is provided
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file);
      updateData.image = imageUrl;
    }
    
    const updatedCity = await City.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedCity) {
      return res.status(404).json({ msg: "City not found" });
    }
    
    return res.status(200).json({ 
      msg: "City updated successfully", 
      city: updatedCity 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Delete city (Admin only)
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCity = await City.findByIdAndDelete(id);
    
    if (!deletedCity) {
      return res.status(404).json({ msg: "City not found" });
    }
    
    return res.status(200).json({ 
      msg: "City deleted successfully" 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};