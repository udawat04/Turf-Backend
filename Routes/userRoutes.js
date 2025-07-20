const express = require("express")
const { createUser, getUser, login, reset, forgetPassword } = require("../Controller/userController")

const router = express()

router.post("/createUser",createUser)
router.get("/getUser",getUser)

router.post("/login",login)
router.put("/reset",reset)
router.put("/forget",forgetPassword)

module.exports = router