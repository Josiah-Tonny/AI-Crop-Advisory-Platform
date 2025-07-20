import User from '../models/User.js';
import logger from './logger.js';

const initializeAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
    
    if (!adminEmail || !adminPassword) {
      logger.warn('Admin email or password not set in environment variables');
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: adminPassword,
        isVerified: true,
        isAdmin: true,
        isActive: true
      });
      
      await admin.save();
      logger.info('✅ Default admin user created');
    } else if (!existingAdmin.isAdmin) {
      existingAdmin.isAdmin = true;
      existingAdmin.isVerified = true;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      logger.info('✅ Existing user promoted to admin');
    } else {
      logger.info('✅ Admin user already exists');
    }
  } catch (error) {
    logger.error('❌ Error initializing admin user:', error);
  }
};

export default initializeAdmin;
