const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const subscriptionSchema = require('../models/subscriptionSchema');
const addBillingDate = require('../utils/helper');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide an email'],
  },
  password: {
    type: String,
    minLength: 8,
    required: [true, 'Please provide a password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    minLength: 8,
    required: false,
    validate: [
      function (el) {
        return this.password === el;
      },
      'Password do not match',
    ],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  subscriptions: [subscriptionSchema],
  subOverview: {
    type: Object,
    default: {
      billedAmt: 0,
      unbilledAmt: 0,
      totalAmt: 0,
      totalSubs: 'NA',
      billedCount: 'NA',
      unbilledCount: 'NA',
    },
  },
  subCategory: [
    new mongoose.Schema({
      name: {
        type: String,
        required: [true, 'category gatz get name'],
        sparse: true,
      },
      description: {
        type: String,
        required: [true, 'category gatz get description'],
      },
      subscriptions: [
        {
          type: mongoose.ObjectId,
        },
      ],
    }),
  ],
  settings: {
    type: Object,
    budget: {
      type: Number,
      required: [true, 'please provide the updated value'],
      min: 1,
    },
    currency: 'USD',
  },
  isBilled: Boolean,
  refreshToken: String,
  refreshTokenExpires: Date,
  passwordChangedAt: Date,
  passwordResetCode: String,
  passwordResetCodeExpires: Date,
  isValidPasswordResetCode: Boolean,
});

userSchema.pre('save', async function (next) {
  //check if password is being modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }

  next();
});

userSchema.pre(/^findOneAnd/, async function (next) {
  //check if sub overview would be updated
  if (this.getOptions().updateOverView) {
    this.user = await this.model.findOne(this.getFilter());
    console.log(true);
  }

  next();
});

userSchema.post(/^findOneAnd/, async function (docs) {
  if (this.getOptions().updateOverView) {
    this.user.constructor.getSubOverview(this.user._id);
  }
});

userSchema.post(/^(findOne)$/, async function (docs) {
  //Add billing date to queried subs
  if (this.getOptions().addBillingDate) {
    docs = addBillingDate(docs?.subscriptions);
  }

  if (this.getOptions().update) {
    this.user = await this.model.findOne(this.getFilter());
    const budget = this.user.catego;
  }
});

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) => await bcrypt.compare(candidatePassword, userPassword);

userSchema.methods.sameOldPassword = async (
  candidatePassword,
  userPassword
) => await bcrypt.compare(candidatePassword, userPassword);

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (!this.passwordChangedAt) return false;
  return (
    parseInt(this.passwordChangedAt.getTime() / 1000, 10) >
    JWTTimestamp
  );
};

userSchema.methods.createPasswordResetCode = function () {
  const resetCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  this.passwordResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  this.passwordResetCodeExpires = Date.now() + 10 * 60 * 1000;

  return resetCode;
};

userSchema.methods.createRefreshToken = function () {
  const randomToken = crypto.randomBytes(32).toString('hex');

  this.refreshToken = crypto
    .createHash('sha256')
    .update(randomToken)
    .digest('hex');

  this.refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;

  return randomToken;
};

userSchema.methods.isSubExist = async function (id, subId) {
  if (
    this.subCategory
      .filter((subCat) => subCat.id === id)[0]
      .subscriptions.some((sub) => String(sub._id).includes(subId))
  )
    return true;
};

userSchema.statics.getSubOverview = async function (userId) {
  console.log(userId);
  const overview = await this.aggregate([
    {
      $match: { _id: userId },
    },
    {
      $project: {
        subscriptions: 1,
      },
    },
    {
      $unwind: '$subscriptions',
    },
    {
      $group: {
        _id: null,
        totalAmt: { $sum: '$subscriptions.amount' },
        totalSubs: { $sum: 1 },
        billedAmt: {
          $sum: {
            $cond: [
              { $eq: ['$subscriptions.isBilled', true] },
              '$subscriptions.amount',
              0,
            ],
          },
        },
        billedCount: {
          $sum: {
            $cond: [{ $eq: ['$subscriptions.isBilled', true] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        unbilledAmt: { $subtract: ['$totalAmt', '$billedAmt'] },
        unbilledCount: { $subtract: ['$totalSubs', '$billedCount'] },
      },
    },
  ]);

  console.log('overview', overview);
  if (Object.entries(overview).length > 0)
    //updates subOverview on USER if user subscription is updated
    await User.findByIdAndUpdate(userId, {
      subOverview: overview,
    });
  else
    await User.findByIdAndUpdate(userId, {
      subOverview: {
        billedAmt: 0,
        unbilledAmt: 0,
        totalAmt: 0,
        totalSubs: 'NA',
        billedCount: 'NA',
        unbilledCount: 'NA',
      },
    });
};

// userSchema.statics.updateBudget = async function(userId) {
//   const use
// }

const User = mongoose.model('User', userSchema);
module.exports = User;
