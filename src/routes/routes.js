const express = require("express");
const router = express.Router();

const {
  pay,
  home,
  paymentVerification,
} = require("../controller/paymentController");

// @route   POST /api/pay
// @desc    Pay with Payment
// @access  Public
router.post("/pay", pay);

// @route   POST /api/home
// @desc    Home Page
// @access  Public
router.get("/", home);

// @route   POST /api/paymentVerification
// @desc    Payment Verification
// @access  Public
router.post("/paymentVerification", paymentVerification);

module.exports = router;
