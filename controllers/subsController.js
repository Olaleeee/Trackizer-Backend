const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

//CREATE SUBSCRIPTION
exports.createSub = catchAsync(async function (req, res, next) {
  const {
    subscriptions: [newSub],
  } = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        subscriptions: req.body,
      },
    },
    {
      new: true,
      runValidators: true,
      projection: { subscriptions: { $slice: -1 } },
    }
  ).setOptions({ updateOverView: true });

  // console.log(newSub.length);

  res.status(201).json({
    status: "success",
    data: {
      data: newSub,
    },
  });
});

//GET SUBSCRIPTION
exports.getSub = catchAsync(async function (req, res, next) {
  const {
    subscriptions: [subscription],
  } = await User.findOne(
    { _id: req.user._id, "subscriptions._id": req.params.id },
    { subscriptions: 1 },
    { projection: { subscriptions: { $elemMatch: { _id: req.params.id } } } }
  ).setOptions({ addBillingDate: true });

  res.status(200).json({
    status: "success",
    data: {
      data: subscription,
    },
  });
});

//GET ALL SUBSCRIPTIONS
exports.getAllSubs = catchAsync(async function (req, res, next) {
  const { subscriptions } = await User.findById(req.user._id, {
    subscriptions: 1,
  }).setOptions({ addBillingDate: true });

  // console.log(subscriptions);

  res.status(200).json({
    status: "success",
    data: {
      data: subscriptions,
    },
  });
});

//GETS THE SUBSCRIPTION OVERVIEW
exports.getSubOverview = catchAsync(async function (req, res, next) {
  const { subOverview } = await User.findById(req.user._id, { subOverview: 1 });

  res.status(200).json({
    status: "success",
    data: {
      data: subOverview,
    },
  });
});

//UPDATE SUB
exports.updateSub = catchAsync(async function (req, res, next) {
  const { subscriptions: updatedSub } = await User.findOneAndUpdate(
    { _id: req.user._id, "subscriptions._id": req.params.id },
    {
      $set: Object.fromEntries(
        Object.entries(req.body).map((bodyArr) => [
          `subscriptions.$.${bodyArr[0]}`,
          bodyArr[1],
        ])
      ),
    },
    {
      new: true,
      projection: { subscriptions: { $elemMatch: { _id: req.params.id } } },
    }
  ).setOptions({ updateOverView: true });

  console.log(updatedSub);

  if (!updatedSub) return next(new AppError("no doc match", 400));
  res.status(200).json({
    status: "success",
    data: {
      data: updatedSub,
    },
  });
});

//DELETE SUB
exports.deleteSub = catchAsync(async function (req, res, next) {
  console.log(req.params.id);
  await User.findOneAndUpdate(
    { "subscriptions._id": req.params.id },
    {
      $pull: { subscriptions: { _id: req.params.id } },
    },
    { new: true }
  ).setOptions({ updateOverView: true });

  res.status(201).json({
    status: "success",
  });
});
