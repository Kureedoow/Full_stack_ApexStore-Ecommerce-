// src/seed/seedProducts.js
// Seeds products from DummyJSON API (or falls back to local data)

import '../config/env.js';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { createSlug } from '../utils/slugify.js';
import { calculateFinalPrice } from '../utils/calculatePrice.js';

// ─── Fallback local products if API is unavailable ────────────────────────────
const localProducts = [
  {
    title: 'iPhone 15 Pro Max',
    description: 'The latest Apple iPhone with a 48MP camera, A17 Pro chip, and titanium design.',
    price: 1199,
    discountPercentage: 5,
    category: 'electronics',
    brand: 'Apple',
    sku: 'APPLE-IP15PM',
    images: ['https://dummyjson.com/image/400x400/iPhone15'],
    thumbnail: 'https://dummyjson.com/image/400x400/iPhone15',
    stock: 50,
    tags: ['apple', 'iphone', 'smartphone', 'ios'],
    weight: 221,
    dimensions: { width: 76.7, height: 159.9, depth: 8.25 },
    warrantyInformation: '1 year Apple warranty',
    shippingInformation: 'Ships in 1-2 business days',
    returnPolicy: '30-day return policy',
  },
  {
    title: 'Samsung Galaxy S24 Ultra',
    description: 'Samsung flagship with built-in S-Pen, 200MP camera, and Snapdragon 8 Gen 3.',
    price: 1299,
    discountPercentage: 8,
    category: 'electronics',
    brand: 'Samsung',
    sku: 'SAM-GS24U',
    images: ['https://dummyjson.com/image/400x400/SamsungS24'],
    thumbnail: 'https://dummyjson.com/image/400x400/SamsungS24',
    stock: 35,
    tags: ['samsung', 'galaxy', 'android', 'smartphone'],
    warrantyInformation: '1 year Samsung warranty',
    shippingInformation: 'Ships in 1-3 business days',
    returnPolicy: '30-day return policy',
  },
  {
    title: 'MacBook Pro 16" M3',
    description: 'Apple MacBook Pro with M3 Pro chip, 18GB RAM, 512GB SSD — industry-leading performance.',
    price: 2499,
    discountPercentage: 0,
    category: 'electronics',
    brand: 'Apple',
    sku: 'APPLE-MBP16M3',
    images: ['https://dummyjson.com/image/400x400/MacBook'],
    thumbnail: 'https://dummyjson.com/image/400x400/MacBook',
    stock: 20,
    tags: ['apple', 'macbook', 'laptop', 'macos'],
    warrantyInformation: '1 year Apple warranty',
    shippingInformation: 'Ships in 2-4 business days',
    returnPolicy: '14-day return policy',
  },
  {
    title: "Men's Classic Oxford Shirt",
    description: 'Premium 100% cotton Oxford shirt with button-down collar. Available in multiple colors.',
    price: 59.99,
    discountPercentage: 15,
    category: "men's clothing",
    brand: 'ClassicWear',
    sku: 'CW-OXFORD-M',
    images: ['https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg'],
    thumbnail: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
    stock: 100,
    tags: ['shirt', 'men', 'oxford', 'formal'],
    warrantyInformation: 'No warranty',
    returnPolicy: '30-day return policy',
  },
  {
    title: "Women's Floral Summer Dress",
    description: 'Light and flowy floral print dress, perfect for summer outings and beach trips.',
    price: 45.99,
    discountPercentage: 20,
    category: "women's clothing",
    brand: 'BloomWear',
    sku: 'BW-SUMMER-D',
    images: ['https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg'],
    thumbnail: 'https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_.jpg',
    stock: 75,
    tags: ['dress', 'women', 'summer', 'floral'],
    returnPolicy: '30-day return policy',
  },
  {
    title: 'Gold Diamond Engagement Ring',
    description: '18K gold ring with 0.5ct solitaire diamond. Perfect for engagements and special occasions.',
    price: 899,
    discountPercentage: 0,
    category: 'jewellery',
    brand: 'LuxGold',
    sku: 'LG-RING-001',
    images: ['https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg'],
    thumbnail: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg',
    stock: 15,
    tags: ['ring', 'gold', 'diamond', 'jewellery'],
    warrantyInformation: 'Lifetime warranty on craftsmanship',
    returnPolicy: '30-day return policy',
  },
  {
    title: 'Chanel No. 5 Perfume 100ml',
    description: 'The iconic Chanel No. 5 floral fragrance — timeless elegance in a bottle.',
    price: 129,
    discountPercentage: 0,
    category: 'fragrances',
    brand: 'Chanel',
    sku: 'CH-N5-100',
    images: ['https://dummyjson.com/image/400x400/fragrance'],
    thumbnail: 'https://dummyjson.com/image/400x400/fragrance',
    stock: 40,
    tags: ['perfume', 'chanel', 'fragrance', 'luxury'],
    warrantyInformation: 'No warranty',
    returnPolicy: 'No returns on opened fragrances',
  },
  {
    title: 'L\'Oreal Revitalift Serum',
    description: 'Advanced anti-aging serum with 1.5% pure hyaluronic acid. Reduces wrinkles in 8 weeks.',
    price: 32.99,
    discountPercentage: 10,
    category: 'beauty',
    brand: "L'Oreal",
    sku: 'LOR-SERUM-001',
    images: ['https://dummyjson.com/image/400x400/beauty'],
    thumbnail: 'https://dummyjson.com/image/400x400/beauty',
    stock: 120,
    tags: ['serum', 'skincare', 'anti-aging', 'loreal'],
    returnPolicy: '30-day return policy',
  },
  {
    title: 'IKEA MALM Bed Frame Queen',
    description: 'Clean-lined queen bed frame with 4 storage boxes. Fits standard queen mattress.',
    price: 399,
    discountPercentage: 0,
    category: 'furniture',
    brand: 'IKEA',
    sku: 'IK-MALM-Q',
    images: ['https://dummyjson.com/image/400x400/furniture'],
    thumbnail: 'https://dummyjson.com/image/400x400/furniture',
    stock: 25,
    tags: ['bed', 'furniture', 'ikea', 'bedroom'],
    dimensions: { width: 160, height: 38, depth: 209 },
    warrantyInformation: '10 year IKEA warranty',
    shippingInformation: 'Ships in 5-7 business days',
    returnPolicy: '365-day return policy',
  },
  {
    title: 'Organic Valley Whole Milk 1 Gallon',
    description: 'USDA certified organic whole milk from pasture-raised cows. No hormones or antibiotics.',
    price: 7.99,
    discountPercentage: 0,
    category: 'groceries',
    brand: 'Organic Valley',
    sku: 'OV-MILK-1G',
    images: ['https://dummyjson.com/image/400x400/grocery'],
    thumbnail: 'https://dummyjson.com/image/400x400/grocery',
    stock: 200,
    tags: ['milk', 'organic', 'dairy', 'grocery'],
    shippingInformation: 'Ships with cold packs',
    returnPolicy: 'No returns on perishables',
  },
  {
    title: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise cancellation with 30-hour battery life and Hi-Res audio.',
    price: 349,
    discountPercentage: 12,
    category: 'electronics',
    brand: 'Sony',
    sku: 'SONY-WH1000XM5',
    images: ['https://dummyjson.com/image/400x400/headphones'],
    thumbnail: 'https://dummyjson.com/image/400x400/headphones',
    stock: 60,
    tags: ['headphones', 'sony', 'noise-cancelling', 'wireless'],
    warrantyInformation: '1 year Sony warranty',
    returnPolicy: '30-day return policy',
  },
  {
    title: 'Nike Air Max 270',
    description: 'Iconic Nike Air Max with the largest Air unit yet. Lightweight and comfortable all-day wear.',
    price: 150,
    discountPercentage: 0,
    category: "men's clothing",
    brand: 'Nike',
    sku: 'NK-AM270',
    images: ['https://dummyjson.com/image/400x400/shoes'],
    thumbnail: 'https://dummyjson.com/image/400x400/shoes',
    stock: 80,
    tags: ['nike', 'shoes', 'sneakers', 'airmax'],
    warrantyInformation: '1 year Nike warranty',
    returnPolicy: '60-day return policy',
  },
  {
    title: 'Instant Pot Duo 7-in-1',
    description: '7-in-1 multi-use programmable pressure cooker, slow cooker, rice cooker, steamer.',
    price: 89.99,
    discountPercentage: 25,
    category: 'home & kitchen',
    brand: 'Instant Pot',
    sku: 'IP-DUO-7IN1',
    images: ['https://dummyjson.com/image/400x400/kitchen'],
    thumbnail: 'https://dummyjson.com/image/400x400/kitchen',
    stock: 45,
    tags: ['instant pot', 'kitchen', 'cooking', 'appliance'],
    warrantyInformation: '1 year manufacturer warranty',
    returnPolicy: '30-day return policy',
  },
  {
    title: 'Adidas Ultraboost 23 Running Shoes',
    description: 'Responsive running shoes with BOOST midsole and Primeknit upper for ultimate comfort.',
    price: 190,
    discountPercentage: 10,
    category: 'sports',
    brand: 'Adidas',
    sku: 'ADI-UB23',
    images: ['https://dummyjson.com/image/400x400/adidas'],
    thumbnail: 'https://dummyjson.com/image/400x400/adidas',
    stock: 55,
    tags: ['adidas', 'running', 'shoes', 'sports'],
    warrantyInformation: 'No warranty',
    returnPolicy: '30-day return policy',
  },
  {
    title: "Women's Gold Tennis Bracelet",
    description: 'Elegant 14K gold tennis bracelet with 3ct total diamond weight.',
    price: 499,
    discountPercentage: 5,
    category: 'jewellery',
    brand: 'DiamondCraft',
    sku: 'DC-BRACELET-01',
    images: ['https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_FMwebp_QL65_.jpg'],
    thumbnail: 'https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_FMwebp_QL65_.jpg',
    stock: 12,
    tags: ['bracelet', 'gold', 'diamond', 'jewellery'],
    warrantyInformation: 'Lifetime craftsmanship warranty',
    returnPolicy: '30-day return policy',
  },
  {
    title: 'Dell XPS 15 Laptop',
    description: 'Dell XPS 15 with Intel Core i7-13700H, 16GB RAM, OLED display, RTX 4060.',
    price: 1899,
    discountPercentage: 7,
    category: 'electronics',
    brand: 'Dell',
    sku: 'DELL-XPS15',
    images: ['https://dummyjson.com/image/400x400/dell'],
    thumbnail: 'https://dummyjson.com/image/400x400/dell',
    stock: 18,
    tags: ['dell', 'laptop', 'xps', 'windows'],
    warrantyInformation: '1 year Dell warranty',
    returnPolicy: '30-day return policy',
  },
];

// ─── Transform DummyJSON product to our model ─────────────────────────────────
const transformDummyJsonProduct = (p) => ({
  title: p.title,
  description: p.description,
  price: p.price,
  discountPercentage: p.discountPercentage || 0,
  category: p.category?.toLowerCase() || 'uncategorized',
  brand: p.brand || '',
  sku: p.sku || `DJ-SKU-${p.id}`,
  images: p.images && p.images.length > 0 ? p.images : [p.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
  thumbnail: p.thumbnail || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  stock: p.stock || 25,
  rating: p.rating || 4.5,
  reviewCount: p.reviews ? p.reviews.length : Math.floor(Math.random() * 50) + 10,
  minimumOrderQuantity: p.minimumOrderQuantity || 1,
  tags: p.tags || [p.category?.toLowerCase() || 'general'],
  weight: p.weight || 1,
  dimensions: p.dimensions
    ? { width: p.dimensions.width, height: p.dimensions.height, depth: p.dimensions.depth }
    : {},
  warrantyInformation: p.warrantyInformation || '1 year brand warranty',
  shippingInformation: p.shippingInformation || 'Ships in 2-4 business days',
  returnPolicy: p.returnPolicy || '30-day return policy',
});

// ─── Transform FakeStoreAPI product to our model ──────────────────────────────
const transformFakeStoreProduct = (p) => {
  let category = (p.category || 'general').toLowerCase();
  if (category === "men's clothing") category = 'mens-clothing';
  if (category === "women's clothing") category = 'womens-clothing';
  if (category === 'jewelery') category = 'jewellery';

  return {
    title: p.title,
    description: p.description,
    price: p.price,
    discountPercentage: Math.floor(Math.random() * 15),
    category,
    brand: 'FakeStore Brand',
    sku: `FS-SKU-${p.id}`,
    images: [p.image],
    thumbnail: p.image,
    stock: Math.floor(Math.random() * 40) + 10,
    rating: p.rating?.rate || 4.2,
    reviewCount: p.rating?.count || Math.floor(Math.random() * 80) + 15,
    minimumOrderQuantity: 1,
    tags: [category, 'fakestore', 'trending'],
    weight: 1,
    warrantyInformation: 'Standard manufacturer warranty',
    shippingInformation: 'Ships in 1-3 business days',
    returnPolicy: '30-day return policy',
  };
};

const seedProducts = async () => {
  await mongoose.connect(env.mongodb.uri);
  console.log('✅ Connected to MongoDB');

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('❌ Admin user not found. Run seedAdmin first.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const Category = (await import('../models/Category.js')).default;
  let allProducts = [];

  // 1. Fetch from DummyJSON
  try {
    console.log('🌐 Fetching products from DummyJSON (https://dummyjson.com/products)...');
    const djRes = await fetch('https://dummyjson.com/products?limit=100');
    if (djRes.ok) {
      const djData = await djRes.json();
      const djProducts = djData.products.map(transformDummyJsonProduct);
      console.log(`  ✅ Fetched ${djProducts.length} products from DummyJSON`);
      allProducts.push(...djProducts);
    }
  } catch (err) {
    console.log('  ⚠️ DummyJSON fetch failed, using fallback:', err.message);
  }

  // 2. Fetch from FakeStoreAPI
  try {
    console.log('🌐 Fetching products from FakeStore API (https://fakestoreapi.com/products)...');
    const fsRes = await fetch('https://fakestoreapi.com/products');
    if (fsRes.ok) {
      const fsData = await fsRes.json();
      const fsProducts = fsData.map(transformFakeStoreProduct);
      console.log(`  ✅ Fetched ${fsProducts.length} products from FakeStore API`);
      allProducts.push(...fsProducts);
    }
  } catch (err) {
    console.log('  ⚠️ FakeStoreAPI fetch failed, skipping:', err.message);
  }

  // Fallback if APIs failed
  if (allProducts.length === 0) {
    console.log('⚠️ Using local fallback products');
    allProducts = localProducts;
  }

  // Ensure all categories exist in database
  const uniqueCategories = [...new Set(allProducts.map((p) => p.category))];
  for (const catName of uniqueCategories) {
    const slug = createSlug(catName);
    const existing = await Category.findOne({ slug });
    if (!existing) {
      const displayName = catName
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      await Category.create({
        name: displayName,
        slug,
        description: `Explore the finest products in ${displayName}`,
        image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400',
      });
      console.log(`  🏷️ Category created: ${displayName} (${slug})`);
    }
  }

  let created = 0;
  let updated = 0;

  for (const productData of allProducts) {
    let slug = createSlug(productData.title);

    const finalPrice = calculateFinalPrice(productData.price, productData.discountPercentage);

    const existing = await Product.findOne({
      $or: [{ slug }, { sku: productData.sku }, { title: productData.title }],
    });

    if (existing) {
      await Product.findByIdAndUpdate(existing._id, {
        ...productData,
        finalPrice,
        isPublished: true,
      });
      updated++;
    } else {
      await Product.create({
        ...productData,
        slug,
        finalPrice,
        createdBy: admin._id,
        isPublished: true,
      });
      created++;
      console.log(`  ✅ Created: ${productData.title}`);
    }
  }

  console.log(`\n📦 Products Seeding Summary — Created: ${created}, Updated: ${updated}, Total: ${allProducts.length}`);

  // Also seed some coupons
  await seedCoupons();

  await mongoose.disconnect();
};

// ─── Also seed coupons while we're here ──────────────────────────────────────
const seedCoupons = async () => {
  const Coupon = (await import('../models/Coupon.js')).default;

  const coupons = [
    {
      code: 'WELCOME10',
      description: '10% off for new customers',
      discountType: 'percentage',
      discountValue: 10,
      minimumPurchase: 50,
      expiryDate: new Date('2026-12-31'),
      usageLimit: 1000,
    },
    {
      code: 'SAVE20',
      description: '$20 off orders over $200',
      discountType: 'fixed',
      discountValue: 20,
      minimumPurchase: 200,
      expiryDate: new Date('2026-12-31'),
      usageLimit: 500,
    },
    {
      code: 'FLASH30',
      description: '30% off — limited time flash sale',
      discountType: 'percentage',
      discountValue: 30,
      minimumPurchase: 100,
      maximumDiscount: 150,
      expiryDate: new Date('2026-09-30'),
      usageLimit: 200,
    },
    {
      code: 'FREESHIP',
      description: 'Free shipping (waive shipping fee)',
      discountType: 'fixed',
      discountValue: 9.99,
      minimumPurchase: 0,
      expiryDate: new Date('2026-12-31'),
      usageLimit: null,
    },
  ];

  for (const c of coupons) {
    const existing = await Coupon.findOne({ code: c.code });
    if (!existing) {
      await Coupon.create(c);
      console.log(`  🎟️  Coupon created: ${c.code}`);
    }
  }
};

seedProducts().catch((err) => {
  console.error('❌ Product seed failed:', err.message);
  process.exit(1);
});
