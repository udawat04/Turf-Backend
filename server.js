const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const fs = require("fs")

const PORT = 5000

const userRouter = require("./Routes/userRoutes")
const adminRouter = require("./Routes/adminRoute")

const cors = require("cors")

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/user",userRouter)
app.use("/admin",adminRouter)

app.listen(PORT , ()=>{
    console.log(`Server is running on ${PORT} Port`)
})