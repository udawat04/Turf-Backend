const express = require("express")
const { 
  createUser, 
  getUser, 
  login, 
  updateUser,
  deleteUser,
  getUserProfile,
  verifyCredentialsAndSendOTP,
  sendForgetOTP,
  verifyResetOTP,
  verifyForgetOTP,
  changeResetPassword,
  changeForgetPassword
} = require("../Controller/userController")
const { authenticateToken } = require("../middleware/auth")
const upload = require("../middleware/upload")

const router = express()

router.post("/createUser", upload.single('image'), createUser)
router.get("/getUser",getUser)
router.post("/login",login)

// OTP routes for password reset (Two-step process)
router.post("/verifyCredentialsAndSendOTP", verifyCredentialsAndSendOTP)
router.post("/verifyResetOTP", verifyResetOTP)
router.post("/changeResetPassword", changeResetPassword)

// OTP routes for forget password (Two-step process)
router.post("/sendForgetOTP", sendForgetOTP)
router.post("/verifyForgetOTP", verifyForgetOTP)
router.post("/changeForgetPassword", changeForgetPassword)

// Protected routes (require authentication)
router.get("/profile", authenticateToken, getUserProfile)
router.put("/update", authenticateToken, upload.single('image'), updateUser)
router.delete("/delete", authenticateToken, deleteUser)

module.exports = router