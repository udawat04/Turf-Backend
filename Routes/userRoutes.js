const express = require("express")
const { 
  createUser, 
  getUser, 
  login, 
  reset, 
  forgetPassword,
  updateUser,
  deleteUser,
  getUserProfile
} = require("../Controller/userController")
const { authenticateToken } = require("../middleware/auth")
const upload = require("../middleware/upload")

const router = express()

router.post("/createUser",createUser)
router.get("/getUser",getUser)
router.post("/login",login)
router.put("/reset",reset)
router.put("/forget",forgetPassword)

// Protected routes (require authentication)
router.get("/profile", authenticateToken, getUserProfile)
router.put("/update", authenticateToken, upload.single('image'), updateUser)
router.delete("/delete", authenticateToken, deleteUser)

module.exports = router