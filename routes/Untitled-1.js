const express = require("express");
const router = express.Router();
const cleanBody = require("../middlewares/cleanbody");
const AuthController = require("../src/users/user.controller");
//Define endpoints
router.post("/signup", cleanBody, AuthController.Signup);
module.exports = router;e