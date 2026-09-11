// src/seed/seedCategories.js
// Seeds all product categories

import '../config/env.js';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import Category from '../models/Category.js';
import { createSlug } from '../utils/slugify.js';

const categories = [
  {
    name: 'Electronics',
    description: 'Smartphones, laptops, tablets, cameras, and all electronic devices',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
  },
  {
    name: "Men's Clothing",
    description: 'Fashion for men — shirts, trousers, suits, and casual wear',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400',
  },
  {
    name: "Women's Clothing",
    description: 'Fashion for women — dresses, tops, skirts, and more',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
  },
  {
    name: 'Jewellery',
    description: 'Rings, necklaces, bracelets, and luxury accessories',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
  },
  {
    name: 'Beauty',
    description: 'Skincare, makeup, and personal care products',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  },
  {
    name: 'Fragrances',
    description: 'Perfumes, colognes, and body sprays',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400',
  },
  {
    name: 'Furniture',
    description: 'Home and office furniture, sofas, beds, and décor',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
  },
  {
    name: 'Groceries',
    description: 'Fresh food, pantry staples, and everyday essentials',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
  },
  {
    name: 'Sports',
    description: 'Sports equipment, activewear, and outdoor gear',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',
  },
  {
    name: 'Home & Kitchen',
    description: 'Kitchen appliances, cookware, and home accessories',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
  },
];

const seedCategories = async () => {
  await mongoose.connect(env.mongodb.uri);
  console.log('✅ Connected to MongoDB');

  let created = 0;
  let skipped = 0;

  for (const cat of categories) {
    const slug = createSlug(cat.name);
    const existing = await Category.findOne({ slug });

    if (existing) {
      skipped++;
      continue;
    }

    await Category.create({ ...cat, slug });
    created++;
    console.log(`  ✅ Created: ${cat.name}`);
  }

  console.log(`\n📦 Categories — Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
};

seedCategories().catch((err) => {
  console.error('❌ Category seed failed:', err.message);
  process.exit(1);
});
