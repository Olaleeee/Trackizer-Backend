const express = require("express");
const authController = require("../controllers/authController");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

//CATEGORY ROUTES
router.use(authController.protect);

router.patch("/:id/new-sub/:subId", categoryController.addNewSub);

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);
router
  .route("/:id")
  .get(categoryController.getCategory)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
