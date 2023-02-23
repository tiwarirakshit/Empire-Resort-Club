const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  uniqueId: {
    type: String,
    default: "0",
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  entry: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

const paymentModel = mongoose.model("Payment", paymentSchema);
module.exports = paymentModel;
