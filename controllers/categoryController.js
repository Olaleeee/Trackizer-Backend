//CREATING SUBS CATEGORY UNDER USER
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

exports.createCategory = catchAsync(async function (req, res, next) {
  const {
    subCategory: [newCategory],
  } = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        subCategory: req.body,
      },
    },
    {
      runValidators: true,
      new: true,
      projection: { subCategory: { $slice: -1 } },
    }
  );

  console.log(newCategory);

  res.status(201).json({
    status: "success",
    data: {
      data: newCategory,
    },
  });
});

exports.getCategory = catchAsync(async function (req, res, next) {
  const [category] = await User.findOne(
    { _id: req.user._id, "subCategory._id": req.params.id },
    {
      "subCategory.$": 1,
    }
  );

  // console.log(category);

  res.status(200).json({
    status: "success",
    data: {
      data: category,
    },
  });
});

//GETTING ALL CATEGORIES
exports.getAllCategories = catchAsync(async function (req, res, next) {
  const { subCategory } = await User.findById(req.user._id, {
    subCategory: 1,
  });

  res.status(200).json({
    status: "success",
    data: {
      data: subCategory,
    },
  });
});

exports.updateCategory = catchAsync(async function (req, res, next) {
  if (req.body.id) {
    return;
  }
  const updatedCategory = await User.findOneAndUpdate(
    { _id: req.user._id, "category._id": req.params.id },
    {
      $set: Object.fromEntries(
        Object.entries(req.body).map((bodyArr) => [
          `category.$.${bodyArr[0]}`,
          bodyArr[1],
        ])
      ),
    },
    {
      new: true,
      runValidators: true,
      projection: { subCategory: { $elemMatch: { _id: req.params.id } } },
    }
  );

  if (!updatedSub)
    return next(new AppError("No category update matched", 400));

  res.status(200).json({
    status: "success",
    data: {
      data: updatedCategory,
    },
  });
});

exports.deleteCategory = catchAsync(async function (req, res, next) {
  await User.findOneAndUpdate(
    { _id: req.user._id, "subscriptions._id": req.params.id },
    {
      $pull: { subCategory: { _id: req.params.id } },
    }
  );

  res.status(201).json({
    status: "success",
  });
});

exports.addNewSub = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.user._id);

  if (await user.isSubExist(req.params.id, req.params.subId))
    return next(new AppError("already in that category", 400));

  const a = await User.findOneAndUpdate(
    { _id: req.user._id, "subCategory._id": req.params.id },
    {
      $push: {
        "subCategory.$.subscriptions": req.params.subId,
      },
    },
    {
      new: true,
      runValidators: true,
      projection: { subCategory: { $elemMatch: { _id: req.params.id } } },
    }
  );

  // console.log(a);

  if (!a) return next(new AppError("No category update matched", 400));

  res.status(200).json({
    status: "success",
    data: {
      data: a,
    },
  });
});
