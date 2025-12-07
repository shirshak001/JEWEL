require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'shirshakmondaljspbuet@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }
    
    // Create admin
    const admin = await User.create({
      email: 'shirshakmondaljspbuet@gmail.com',
      password: 'Mondal@2003',
      role: 'admin',
      name: 'Shirshak Mondal'
    });
    
    console.log('✅ Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
