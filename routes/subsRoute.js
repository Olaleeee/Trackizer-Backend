const express = require("express");
const authController = require("../controllers/authController");
const subController = require("../controllers/subsController");
const router = express.Router();

//SUBSCRIPTION ROUTES
router.use(authController.protect);

router.route("/").post(subController.createSub).get(subController.getAllSubs);
router.get("/overview", subController.getSubOverview);
router
  .route("/:id")
  .get(subController.getSub)
  .patch(subController.updateSub)
  .delete(subController.deleteSub);

module.exports = router;
