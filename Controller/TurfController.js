const Turf = require("../Model/TurfModel");
const cloudinary = require("../config/cloudinaryConfig");

// Upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'turf-booking/turfs',
      use_filename: true
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Create new turf (Admin only)
exports.createTurf = async (req, res) => {
  try {
    const { turfName, city, location, price } = req.body;
    
    if (!turfName || !location) {
      return res.status(400).json({ msg: "Turf name and location are required" });
    }

    let turfData = { turfName, city, location, price };
    
    // Handle image upload if file is provided
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file);
      turfData.image = imageUrl;
    }

    const newTurf = new Turf(turfData);
    await newTurf.save();

    return res.status(201).json({ 
      msg: "Turf created successfully", 
      turf: newTurf 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Get all turfs
exports.getAllTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find().sort({ createdAt: -1 });
    return res.status(200).json({ 
      msg: "Turfs retrieved successfully", 
      result: turfs 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Get turf by ID
exports.getTurfById = async (req, res) => {
  try {
    const { id } = req.params;
    const turf = await Turf.findById(id);
    
    if (!turf) {
      return res.status(404).json({ msg: "Turf not found" });
    }
    
    return res.status(200).json({ turf });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Get turfs by city
exports.getTurfsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const turfs = await Turf.find({ city: city });
    
    return res.status(200).json({ 
      msg: "Turfs retrieved successfully", 
      result: turfs 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Update turf (Admin only)
exports.updateTurf = async (req, res) => {
  try {
    const { id } = req.params;
    const { turfName, city, location, price } = req.body;
    
    let updateData = { turfName, city, location, price };
    
    // Handle image upload if file is provided
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file);
      updateData.image = imageUrl;
    }
    
    const updatedTurf = await Turf.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedTurf) {
      return res.status(404).json({ msg: "Turf not found" });
    }
    
    return res.status(200).json({ 
      msg: "Turf updated successfully", 
      turf: updatedTurf 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Delete turf (Admin only)
exports.deleteTurf = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedTurf = await Turf.findByIdAndDelete(id);
    
    if (!deletedTurf) {
      return res.status(404).json({ msg: "Turf not found" });
    }
    
    return res.status(200).json({ 
      msg: "Turf deleted successfully" 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};