const paymentModel = require("../models/payment");
const { validationResult } = require("express-validator");
const Razorpay = require("razorpay");
const shortid = require("shortid");

// @route   POST /api/pay
// @desc    Pay with Payment
// @access  Public
const pay = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, phone, entry, type } = req.body;
  try {
    let amount = 0;
    if (type === "male") {
      amount = 1200;
    } else if (type === "female") {
      amount = 1000;
    } else if (type === "couple") {
      amount = 2000;
    }
    // const payment = new paymentModel({
    //   amount,
    //   name,
    //   phone,
    //   entry,
    //   type,
    // });
    // await payment.save();

    const instance = new Razorpay({
      key_id: process.env.RAZOR_PAY_KEY_ID,
      key_secret: process.env.RAZOR_PAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: shortid.generate(),
      payment_capture: "1",
    });

    console.log(order);

    const paymentDetail = {
      orderId: order.id,
      receiptId: order.receipt,
      amount: order.amount,
      currency: order.currency,
      createdAt: order.created_at,
      status: order.status,
      signature: order.signature,
      name,
      phone,
      amount,
    };

    res.status(201).render("response", {
      title: "Checkout",
      status: "SUCCESS",
      razorPayKeyId: process.env.RAZOR_PAY_KEY_ID,
      paymentDetail: paymentDetail,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).render("error", {
      message: err.message,
    });
  }
};

// @route   POST /api/home
// @desc    Home Page
// @access  Public
const home = async (req, res) => {
  try {
    res.status(200).render("index");
  } catch (err) {
    res.status(500).render("error", {
      message: err.message,
    });
  }
};

// @route   POST /api/paymentVerification
// @desc    Payment Verification
// @access  Public

const paymentVerification = async (req, res) => {
  try {
    const data =
      req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

    let crypto = require("crypto");

    let expectedSignature = crypto
      .createHmac("sha256", process.env.RAZOR_PAY_KEY_SECRET)
      .update(data.toString())
      .digest("hex");

    const noOfPayments = await db.get().collection("payment").find({}).count();

    // Compare the signatures
    if (expectedSignature === req.body.razorpay_signature) {
      // if same, then find the previously stored record using orderId,
      // and update paymentId and signature, and set status to paid.
      const result = await db
        .get()
        .collection("payment")
        .findOneAndUpdate(
          { orderId: req.body.razorpay_order_id },
          {
            $set: {
              paymentId: req.body.razorpay_payment_id,
              signature: req.body.razorpay_signature,
              status: "paid",
              orderNumber: noOfPayments + 1,
            },
          },
          { new: true }
        );

      if (result.ok > 0) {
        const fetchOrderDetails = await db
          .get()
          .collection("payment")
          .findOne({ orderId: req.body.razorpay_order_id });

        let response;

        // convert createdAt 1657228803 to date format
        const createdAt = new Date(fetchOrderDetails.createdAt * 1000);
        const date = createdAt.getDate();
        const month = createdAt.getMonth() + 1;
        const year = createdAt.getFullYear();
        const orderDate = date + "/" + month + "/" + year;

        if (!!fetchOrderDetails) {
          response = sendMailForInvoice(
            fetchOrderDetails.name,
            fetchOrderDetails.email,
            fetchOrderDetails.phone,
            fetchOrderDetails.course,
            fetchOrderDetails.orderId,
            noOfPayments + 1,
            fetchOrderDetails.amount,
            fetchOrderDetails.duration,
            orderDate
          );
          if (response) {
            // Render payment success page, if saved successfully
            res.render("user/success", {
              title: "Payment verification successful",
              paymentDetail: fetchOrderDetails,
            });
            return;
          } else {
            res.render("user/failed", {
              title: "Payment verification unsuccessful",
            });
            return;
          }
        } else {
          res.render("user/failed", {
            title: "Payment verification unsuccessful",
          });
          return;
        }
      } else {
        res.render("user/failed", {
          title: "Payment verification unsuccessful",
        });
        return;
      }
    } else {
      res.status(500).json({ message: "failed" });
      return;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
    return;
  }
};

module.exports = {
  pay,
  home,
  paymentVerification,
};
