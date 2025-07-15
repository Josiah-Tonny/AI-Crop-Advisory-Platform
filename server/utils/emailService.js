const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send OTP email
const sendOTPEmail = async (email, otpCode, firstName) => {
  try {
    const transporter = createTransporter();

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
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #10B981; text-align: center; padding: 20px; background-color: #F0FDF4; border-radius: 8px; margin: 20px 0; letter-spacing: 2px; }
            .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 14px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌱 AgriAI</div>
              <p>AI-Powered Agricultural Advisory Platform</p>
            </div>
            
            <h2>Hello ${firstName}!</h2>
            
            <p>Welcome to AgriAI! To complete your registration and start accessing our AI-powered agricultural insights, please verify your email address using the code below:</p>
            
            <div class="otp-code">${otpCode}</div>
            
            <p>Enter this verification code in the app to activate your account. This code will expire in <strong>10 minutes</strong> for security reasons.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>Never share this code with anyone</li>
                <li>AgriAI will never ask for your verification code via phone or email</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
            
            <h3>What's Next?</h3>
            <p>Once verified, you'll have access to:</p>
            <ul>
              <li>🌤️ Real-time weather forecasts and agricultural insights</li>
              <li>🌾 AI-powered crop recommendations for your location</li>
              <li>🧪 Soil health analysis and improvement suggestions</li>
              <li>🐛 Pest identification and integrated management solutions</li>
              <li>💧 Smart irrigation scheduling and water conservation tips</li>
              <li>📚 Educational resources and farming best practices</li>
              <li>👥 Community forum to connect with fellow farmers</li>
            </ul>
            
            <p>Need help? Our support team is here to assist you at <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.SMTP_USER}">support@agriai.com</a></p>
            
            <div class="footer">
              <p><strong>AgriAI - Transforming Agriculture with AI</strong></p>
              <p>Empowering smallholder farmers across East and Central Africa</p>
              <p>This email was sent to ${email}. If you didn't create an account, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} AgriAI. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${firstName}!
        
        Welcome to AgriAI! Your email verification code is: ${otpCode}
        
        Enter this code in the app to verify your email address. This code will expire in 10 minutes.
        
        Never share this code with anyone. If you didn't request this code, please ignore this email.
        
        Need help? Contact us at ${process.env.SUPPORT_EMAIL || process.env.SMTP_USER}
        
        AgriAI - Transforming Agriculture with AI
        © ${new Date().getFullYear()} AgriAI. All rights reserved.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    throw new Error('Failed to send verification email');
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
      subject: `Welcome to AgriAI, ${firstName}! 🌱`,
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
              <div class="logo">🌱 AgriAI</div>
              <p>Welcome to the Future of Farming!</p>
            </div>
            
            <h2>Congratulations, ${firstName}! 🎉</h2>
            
            <p>Your email has been successfully verified and your AgriAI account is now active! You're now part of a growing community of smart farmers using AI to transform agriculture.</p>
            
            <h3>🚀 Get Started with These Features:</h3>
            
            <div class="feature">
              <strong>🌤️ Weather Intelligence</strong><br>
              Get accurate weather forecasts with agricultural insights tailored to your location.
            </div>
            
            <div class="feature">
              <strong>🌾 Smart Crop Recommendations</strong><br>
              Discover the best crops to plant based on your soil, climate, and market conditions.
            </div>
            
            <div class="feature">
              <strong>🧪 Soil Health Analysis</strong><br>
              Understand your soil composition and get personalized improvement recommendations.
            </div>
            
            <div class="feature">
              <strong>🐛 Pest Management</strong><br>
              Identify pests early and get integrated management solutions to protect your crops.
            </div>
            
            <div class="feature">
              <strong>💧 Irrigation Optimization</strong><br>
              Save water and improve yields with smart irrigation scheduling.
            </div>
            
            <h3>🎓 Your Learning Journey</h3>
            <p>Access our comprehensive library of:</p>
            <ul>
              <li>📚 Educational courses and tutorials</li>
              <li>📖 Best practices guides</li>
              <li>🎥 Video demonstrations</li>
              <li>📊 Market insights and trends</li>
            </ul>
            
            <h3>👥 Join Our Community</h3>
            <p>Connect with fellow farmers, share experiences, and learn from agricultural experts in our community forum.</p>
            
            <p><strong>Need Help Getting Started?</strong><br>
            Our support team is ready to help you make the most of AgriAI. Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.SMTP_USER}">support@agriai.com</a></p>
            
            <div class="footer">
              <p><strong>Happy Farming! 🌱</strong></p>
              <p>The AgriAI Team</p>
              <p>&copy; ${new Date().getFullYear()} AgriAI. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    // Don't throw error for welcome email failure
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};