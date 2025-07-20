import nodemailer from 'nodemailer';

// Create transporter with better error handling
const createTransporter = () => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP configuration is incomplete. Please check your environment variables.');
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        // Only for development - remove in production or use proper certificates
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      },
      debug: process.env.NODE_ENV !== 'production',
      logger: process.env.NODE_ENV !== 'production'
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw error;
  }
};

// Send OTP email with improved error handling
export const sendOTPEmail = async (email, otpCode, firstName) => {
  const transporter = createTransporter();

  try {
    console.log(`Attempting to send OTP email to: ${email}`);
    
    const mailOptions = {
      from: {
        name: process.env.APP_NAME || 'AgriAI',
        address: process.env.SMTP_FROM || process.env.SMTP_USER
      },
      to: email,
      subject: `${otpCode} - Your AgriAI Verification Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification - AgriAI</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #10B981, #059669); color: white; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #10B981; text-align: center; padding: 20px; background-color: #F0FDF4; border-radius: 8px; margin: 20px 0; letter-spacing: 2px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <p>Hello ${firstName || 'there'},</p>
            <p>Your verification code is:</p>
            <div class="otp-code">${otpCode}</div>
            <p>This code will expire in 10 minutes.</p>
            <div class="footer">
              <p>If you didn't request this, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'AgriAI'}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: process.env.APP_NAME || 'AgriAI',
        address: process.env.SMTP_FROM || process.env.SMTP_USER
      },
      to: email,
      subject: `Welcome to ${process.env.APP_NAME || 'AgriAI'}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome - ${process.env.APP_NAME || 'AgriAI'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #10B981, #059669); color: white; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${process.env.APP_NAME || 'AgriAI'}!</h1>
            </div>
            <p>Hello ${firstName || 'there'},</p>
            <p>Thank you for joining ${process.env.APP_NAME || 'AgriAI'}. We're excited to have you on board!</p>
            <p>Get started by exploring our platform and all the features we offer.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Go to Dashboard</a>
            </div>
            <p>If you have any questions, feel free to reply to this email.</p>
            <div class="footer">
              <p>Best regards,<br>The ${process.env.APP_NAME || 'AgriAI'} Team</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'AgriAI'}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

export default {
  sendOTPEmail,
  sendWelcomeEmail
};