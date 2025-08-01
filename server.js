const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const fs = require("fs")

const PORT = process.env.PORT || 5000

const userRouter = require("./Routes/userRoutes")
const adminRouter = require("./Routes/adminRoute")

const cors = require("cors")

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

mongoose.connect("mongodb+srv://udawat:1234@udawat.1cdje.mongodb.net/Turf-Booking-System")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express()

app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:3000",
      "https://turf-frontend-ashen.vercel.app",
      "https://turf-booking-system-frontend.vercel.app"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use("/user", userRouter)
app.use("/admin", adminRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT} Port`)
})