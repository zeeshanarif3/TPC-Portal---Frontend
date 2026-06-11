const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User'); 

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tpc.com';
    
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (adminExists) {
      console.log('Default admin account already exists. Skipping initialization.');
      return;
    }

    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const defaultAdmin = new User({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await defaultAdmin.save();
    console.log(`Default admin account created successfully (${adminEmail})!`);
  } catch (error) {
    console.error('Error seeding default admin account:', error);
  }
};

module.exports = seedAdmin;
