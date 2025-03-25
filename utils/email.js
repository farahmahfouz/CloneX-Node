const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 465,
      secure: false,
      auth: {
        user: 'dcdc6c33a77283',
        pass: 'b1a8bf5a6c558a',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: 'Farah Mahfouz <malakmahfouz306@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');

  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
