// src/seed/seedAdmin.js
// Creates the default admin user

import '../config/env.js';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import User from '../models/User.js';

const seedAdmin = async () => {
  await mongoose.connect(env.mongodb.uri);
  console.log('✅ Connected to MongoDB');

  // Seed / update Admin
  let admin = await User.findOne({ email: 'admin@ecommerce.com' });
  if (admin) {
    admin.password = 'Admin@123456';
    admin.role = 'admin';
    admin.isActive = true;
    await admin.save();
    console.log('ℹ️  Admin user updated (password: Admin@123456):', admin.email);
  } else {
    admin = await User.create({
      username: 'admin',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@ecommerce.com',
      password: 'Admin@123456',
      phone: '+1-555-0001',
      role: 'admin',
      isActive: true,
    });
    console.log('✅ Admin user created: admin@ecommerce.com / Admin@123456');
  }

  // Seed / update Customer demo
  let customer = await User.findOne({ email: 'customer@ecommerce.com' });
  if (customer) {
    customer.password = 'Customer@123456';
    customer.role = 'user';
    customer.isActive = true;
    await customer.save();
    console.log('ℹ️  Customer demo user updated (password: Customer@123456):', customer.email);
  } else {
    customer = await User.create({
      username: 'customer',
      firstName: 'John',
      lastName: 'Customer',
      email: 'customer@ecommerce.com',
      password: 'Customer@123456',
      phone: '+1-555-0002',
      role: 'user',
      isActive: true,
    });
    console.log('✅ Customer user created: customer@ecommerce.com / Customer@123456');
  }

  await mongoose.disconnect();
};

seedAdmin().catch((err) => {
  console.error('❌ Admin seed failed:', err.message);
  process.exit(1);
});
