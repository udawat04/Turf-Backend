const express = require("express")
const { 
  createCity, 
  getAllCities, 
  getCityById, 
  updateCity, 
  deleteCity 
} = require("../Controller/TurfCityController")
const { 
  createTurf, 
  getAllTurfs, 
  getTurfById, 
  getTurfsByCity, 
  updateTurf, 
  deleteTurf 
} = require("../Controller/TurfController")
const { authenticateAdmin } = require("../middleware/auth")
const upload = require("../middleware/upload")

const router = express()

// City routes (Admin only)
router.post("/city", authenticateAdmin, upload.single('image'), createCity)
router.get("/city", getAllCities)
router.get("/city/:id", getCityById)
router.put("/city/:id", authenticateAdmin, upload.single('image'), updateCity)
router.delete("/city/:id", authenticateAdmin, deleteCity)

// Turf routes
router.post("/turf", authenticateAdmin, upload.single('image'), createTurf)
router.get("/turf", getAllTurfs)
router.get("/turf/:id", getTurfById)
router.get("/turf/city/:city", getTurfsByCity)
router.put("/turf/:id", authenticateAdmin, upload.single('image'), updateTurf)
router.delete("/turf/:id", authenticateAdmin, deleteTurf)

module.exports = router