const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Format a phone number to E.164 format required by Twilio.
 * Adds +91 (India) prefix if the number is 10 digits and doesn't already have a country code.
 */
function formatPhoneE164(phone) {
  if (!phone) return phone;
  // Remove spaces, dashes, parentheses
  let cleaned = phone.toString().replace(/[\s\-()]/g, "");
  // Already in E.164 format
  if (cleaned.startsWith("+")) return cleaned;
  // 10-digit Indian number
  if (cleaned.length === 10) return `+91${cleaned}`;
  // 12-digit with country code but no +
  if (cleaned.length === 12 && cleaned.startsWith("91")) return `+${cleaned}`;
  // fallback — just add +
  return `+${cleaned}`;
}

const sendSMS = async (to, message) => {
  try {
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    if (!fromNumber) {
      throw new Error(
        "TWILIO_FROM_NUMBER is not set in .env — set it to your Twilio phone number"
      );
    }

    const response = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formatPhoneE164(to),
    });

    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { sendSMS, formatPhoneE164 };
