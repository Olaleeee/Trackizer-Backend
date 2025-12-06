const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

//Update SETTINGS on USER
exports.updateSettings = catchAsync(async function (req, res, next) {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { settings: req.body },
    {
      new: true,
      runValidators: true,
      projection: { settings: 1, email: 1, id: 1 },
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});
