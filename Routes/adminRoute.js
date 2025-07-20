const express = require("express")
const { addCity, getCity } = require("../Controller/TurfCityController")
const { addTurf, getTurf } = require("../Controller/TurfController")

const router = express()

router.post("/addcity",addCity)
router.get("/getcity",getCity)

router.post("/addturf",addTurf)
router.get("/getturf",getTurf)

module.exports = router