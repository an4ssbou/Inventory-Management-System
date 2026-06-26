require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const createOAuthTransporter = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const { token: accessToken } = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });
};

const createPasswordTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const createTransporter = async () => {
  if (!process.env.EMAIL) {
    throw new Error('EMAIL environment variable is required to send emails');
  }

  if (process.env.EMAIL_APP_PASSWORD) {
    return createPasswordTransporter();
  }

  if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.REFRESH_TOKEN) {
    return createOAuthTransporter();
  }

  throw new Error('Email is not configured. Set EMAIL_APP_PASSWORD or OAuth2 variables.');
};

const sendEmail = async (emailOptions) => {
  try {
    const emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};

module.exports = { sendEmail };
