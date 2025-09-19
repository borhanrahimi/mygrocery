const Discount = require("../models/Discount");

exports.validateDiscountCode = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Discount code is required" });
  }

  try {
    const discount = await Discount.findOne({ code: code.toUpperCase() });

    if (!discount) {
      return res.status(404).json({ valid: false, message: "Invalid code" });
    }

    if (discount.expiresAt && new Date() > new Date(discount.expiresAt)) {
      return res.status(410).json({ valid: false, message: "Code expired" });
    }

    res.json({
      valid: true,
      code: discount.code,
      type: discount.type,
      amount: discount.amount
    });
  } catch (err) {
    console.error("❌ Discount lookup error:", err);
    res.status(500).json({ error: "Server error validating discount" });
  }
};
