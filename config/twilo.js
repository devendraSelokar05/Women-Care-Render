const twilio = require("twilio");
 
// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
 
const client = twilio(accountSid, authToken);
 
module.exports = { client, twilioPhone };
 
 
 