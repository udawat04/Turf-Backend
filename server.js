const express = require("express")

const mongoose = require("mongoose")

const PORT = 5000

const userRouter = require("./Routes/userRoutes")
const adminRouter = require("./Routes/adminRoute")


const cors = require("cors")


mongoose.connect("mongodb+srv://udawat:1234@udawat.1cdje.mongodb.net/Turf-Booking-System");

const app = express()

app.use(
  cors({
    origin: ["http://localhost:5173", "https://turf-frontend-ashen.vercel.app"],
    credentials: true,
  })
);


app.use(express.json())

app.use(express.urlencoded())

app.use("/user",userRouter)
app.use("/admin",adminRouter)

app.listen(PORT , ()=>{
    console.log(`Server is running on ${PORT} Port`)
})