const nodemailer = require('nodemailer');

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
const sendOTPEmail = async (email, otpCode, firstName) => {
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
              <p> ${new Date().getFullYear()} ${process.env.APP_NAME || 'AgriAI'}. All rights reserved.</p>
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
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: process.env.APP_NAME || 'AgriAI',
        address: process.env.SMTP_FROM || process.env.SMTP_USER
      },
      to: email,
      subject: `Welcome to AgriAI, ${firstName}! `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to AgriAI</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #10B981, #059669); color: white; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .feature { background-color: #F0FDF4; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10B981; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo"> AgriAI</div>
              <p>Welcome to the Future of Farming!</p>
            </div>
            
            <h2>Congratulations, ${firstName}! </h2>
            
            <p>Your email has been successfully verified and your AgriAI account is now active! You're now part of a growing community of smart farmers using AI to transform agriculture.</p>
            
            <h3> Get Started with These Features:</h3>
            
            <div class="feature">
              <strong> Weather Intelligence</strong><br>
              Get accurate weather forecasts with agricultural insights tailored to your location.
            </div>
            
            <div class="feature">
              <strong> Smart Crop Recommendations</strong><br>
              Discover the best crops to plant based on your soil, climate, and market conditions.
            </div>
            
            <div class="feature">
              <strong> Soil Health Analysis</strong><br>
              Understand your soil composition and get personalized improvement recommendations.
            </div>
            
            <div class="feature">
              <strong> Pest Management</strong><br>
              Identify pests early and get integrated management solutions to protect your crops.
            </div>
            
            <div class="feature">
              <strong> Irrigation Optimization</strong><br>
              Save water and improve yields with smart irrigation scheduling.
            </div>
            
            <h3> Your Learning Journey</h3>
            <p>Access our comprehensive library of:</p>
            <ul>
              <li> Educational courses and tutorials</li>
              <li> Best practices guides</li>
              <li> Video demonstrations</li>
              <li> Market insights and trends</li>
            </ul>
            
            <h3> Join Our Community</h3>
            <p>Connect with fellow farmers, share experiences, and learn from agricultural experts in our community forum.</p>
            
            <p><strong>Need Help Getting Started?</strong><br>
            Our support team is ready to help you make the most of AgriAI. Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.SMTP_USER}">support@agriai.com</a></p>
            
            <div class="footer">
              <p><strong>Happy Farming! </strong></p>
              <p>The AgriAI Team</p>
              <p>& ${new Date().getFullYear()} AgriAI. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(' Welcome email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error(' Failed to send welcome email:', error);
    // Don't throw error for welcome email failure
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};