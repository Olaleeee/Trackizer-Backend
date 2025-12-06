const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A subscription must have its own name"],
    },
    description: {
      type: String,
      required: [true, "A Subscription must have a description"],
    },
    currency: {
      type: String,
      default: "USD",
    },
    amount: {
      type: Number,
      required: [true, "Bill amount is needed"],
    },
    startDate: {
      type: Date,
      required: [true, "provide the date you start this subscription"],
    },
    nextBillingDate: Date,
    billingCycle: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: [true, "provide a billing cycle"],
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },
    plan: {
      type: String,
      enum: ["premium", "free-trial"],
      required: [true, "Subscription gats have a plan"],
    },
    isBilled: {
      type: Boolean,
      default: false,
    },
    category: String,
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

module.exports = subscriptionSchema;
