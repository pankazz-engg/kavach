const express = require("express");
const router = express.Router();
const { sendSMS } = require("../services/twilioServices"); // Fixed: was 'twilioService'

// POST /api/sms/send  — generic send (used internally)
router.post("/send", async (req, res, next) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: "Phone and message required" });
    }

    const result = await sendSMS(phone, message);

    res.json({
      success: true,
      sid: result.sid,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sms/test  — quick test: sends SMS to ALERT_RECIPIENT_PHONE
router.post("/test", async (req, res, next) => {
  try {
    const recipientPhone = process.env.ALERT_RECIPIENT_PHONE;
    if (!recipientPhone) {
      return res
        .status(500)
        .json({ error: "ALERT_RECIPIENT_PHONE not set in .env" });
    }

    const message =
      req.body.message ||
      `🚨 Kavach Test Alert: HIGH risk detected in your ward. Stay alert and follow safety protocols.`;

    const result = await sendSMS(recipientPhone, message);

    res.json({
      success: true,
      message: `Test SMS sent to ${recipientPhone}`,
      sid: result.sid,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
