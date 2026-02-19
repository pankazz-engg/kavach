/**
 * Kavach SMS Boot Script
 * 1. Reads Twilio creds from .env
 * 2. Auto-fetches the Twilio FROM number from the account
 * 3. Sends a real test SMS to ALERT_RECIPIENT_PHONE
 */
require('dotenv').config();
const twilio = require('twilio');

const SID   = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TO    = process.env.ALERT_RECIPIENT_PHONE;

if (!SID || !TOKEN) {
  console.error('❌ TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing from .env');
  process.exit(1);
}

const client = twilio(SID, TOKEN);

async function main() {
  try {
    // Auto-discover the FROM number
    const numbers = await client.incomingPhoneNumbers.list({ limit: 5 });

    if (!numbers.length) {
      console.error('❌ No Twilio phone numbers found in your account.');
      console.error('   Go to console.twilio.com → "Get a phone number" for a free trial number.');
      process.exit(1);
    }

    const fromNumber = numbers[0].phoneNumber;
    console.log(`✅ Found Twilio FROM number: ${fromNumber}`);
    console.log(`📱 Sending SMS to: ${TO}`);

    const msg = await client.messages.create({
      body: `🚨 KAVACH HIGH RISK ALERT TEST\nYour area has been flagged as HIGH risk.\nStay alert, follow safety protocols.\n— Kavach AI System`,
      from: fromNumber,
      to: TO,
    });

    console.log(`\n✅ SMS SENT SUCCESSFULLY!`);
    console.log(`   SID : ${msg.sid}`);
    console.log(`   To  : ${TO}`);
    console.log(`   From: ${fromNumber}`);
    console.log(`\n   👉 Add this to backend/.env:\n   TWILIO_FROM_NUMBER=${fromNumber}`);
  } catch (err) {
    console.error(`\n❌ SMS failed: ${err.message}`);
    if (err.code === 21608) {
      console.error('   Trial account restriction: recipient number must be verified in Twilio console.');
      console.error('   Go to: console.twilio.com → Verified Caller IDs → Add your number');
    }
    process.exit(1);
  }
}

main();
