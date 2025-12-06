const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const router = express.Router();

//Update SETTINGS field on User Doc
router.use(authController.protect);
router.patch("/updateSettings", userController.updateSettings);

module.exports = router;
