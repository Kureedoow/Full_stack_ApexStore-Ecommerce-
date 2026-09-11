# E-Commerce Backend REST API 🛍️

A complete, production-ready E-Commerce Backend API built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**. Architected to connect effortlessly with modern **React** / **Next.js** frontend applications.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Database Schema & Relationships](#-database-schema--relationships)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Database Seeding](#-database-seeding)
- [Running the Server](#-running-the-server)
- [API Endpoints Reference](#-api-endpoints-reference)
  - [Authentication](#authentication-apiauth)
  - [Users & Addresses](#users--addresses-apiusers)
  - [Products](#products-apiproducts)
  - [Categories](#categories-apicategories)
  - [Cart](#cart-apicart)
  - [Wishlist](#wishlist-apiwishlist)
  - [Reviews](#reviews-apireviews--apiproductsproductidreviews)
  - [Coupons](#coupons-apicoupons)
  - [Orders & Checkout](#orders--checkout-apiorders)
  - [Admin Dashboard & Operations](#admin-apiadmin)
- [Error Handling & Response Format](#-error-handling--response-format)
- [Postman Testing](#-postman-testing)
- [Frontend (React/Next.js) Integration Guide](#-frontend-reactnextjs-integration-guide)
- [Deployment](#-deployment)

---

## ✨ Features

- 🔐 **Secure Authentication**: JWT-based access tokens & refresh tokens stored in HTTP-only cookies or Bearer headers. Passwords securely hashed with `bcryptjs`.
- 👥 **Role-Based Authorization**: Distinct capabilities for `user` (customer) and `admin` roles.
- 📦 **Rich Product Catalog**: Product models inspired by DummyJSON & Fake Store API (SKU, brand, tags, dimensions, warranties, dynamic discount calculations, and automatic availability statuses).
- 🔍 **Search, Filtering, Sorting & Pagination**:
  - Full-text multi-field search (`title`, `description`, `brand`, `tags`).
  - Filtering by `category`, `brand`, `minPrice`, `maxPrice`, `minRating`, `maxRating`, and `inStock`.
  - Sorting: `price_asc`, `price_desc`, `rating`, `newest`, `oldest`, `popular`.
  - Structured pagination metadata on all list responses.
- 🛒 **Server-Side Shopping Cart**: Never trusts frontend prices or totals. Auto-computes subtotals, tax, and dynamic shipping thresholds directly from DB prices.
- 💖 **Wishlist**: Per-user product bookmarks with duplicate prevention.
- ⭐ **Verified Reviews**: Users can only review products from orders that have been successfully delivered. Ratings auto-aggregate into the product model.
- 🎟️ **Coupons & Discounts**: Percentage and fixed discount rules with minimum purchase caps, maximum savings limits, expiration dates, and usage limits.
- 🚚 **Orders & Status Lifecycle**: Snapshots product title, price, and media at checkout. Full audit status history tracking (`pending` → `confirmed` → `processing` → `shipped` → `delivered` → `cancelled`).
- 💳 **Pluggable Payment Layer**: Strategy pattern supporting `cash_on_delivery`, `card`, `mobile_payment`, and `online_payment`. Ready for Stripe/PayPal drop-in.
- 📊 **Admin Dashboard & Analytics**: Real-time sales stats, revenue tracking, low-stock warnings, top-selling items, and historical aggregations (daily, weekly, monthly, yearly).
- 🛡️ **Security**: Helmet HTTP headers, CORS with credentials, express-rate-limit throttling, Joi input validation, MongoDB query sanitization, and suppressed internal stack traces in production.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Runtime** | Node.js (v18+) |
| **Framework** | Express.js (ES6+ Modules) |
| **Database** | MongoDB & Mongoose ODM |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser` |
| **Validation** | Joi |
| **Security & Utilities** | `helmet`, `cors`, `express-rate-limit`, `morgan`, `dotenv`, `slugify` |

---

## 🏛 Project Architecture

```
backend(Ecommerce)/
├── src/
│   ├── config/
│   │   ├── db.js                 # Mongoose connection setup
│   │   └── env.js                # Centralized environment variable loader & validator
│   ├── controllers/
│   │   ├── admin.controller.js   # Analytics, user/order administration
│   │   ├── auth.controller.js    # Register, login, refresh, logout, password
│   │   ├── cart.controller.js    # Cart items and server totals
│   │   ├── category.controller.js# Category management
│   │   ├── coupon.controller.js  # Coupon CRUD and validation
│   │   ├── order.controller.js   # Checkout, order list, order cancel
│   │   ├── product.controller.js # Catalog browsing, search, filter, sort
│   │   ├── review.controller.js  # Verified review system
│   │   ├── user.controller.js    # User profiles and multi-address management
│   │   └── wishlist.controller.js# Bookmark products
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification from Header or Cookie
│   │   ├── error.middleware.js   # Centralized error handler & 404 catcher
│   │   ├── rateLimit.middleware.js# General, Auth, and Strict rate limiters
│   │   └── role.middleware.js    # Role guards (e.g. requireRole('admin'))
│   ├── models/
│   │   ├── Cart.js               # Cart Schema
│   │   ├── Category.js           # Category Schema
│   │   ├── Coupon.js             # Coupon Schema
│   │   ├── Order.js              # Order & OrderItems Snapshot Schema
│   │   ├── Product.js            # Product Schema with auto-price hooks
│   │   ├── Review.js             # Review Schema with rating aggregation
│   │   └── User.js               # User & Address Subschema with bcrypt hooks
│   ├── routes/
│   │   ├── admin.routes.js       # /api/admin
│   │   ├── auth.routes.js        # /api/auth
│   │   ├── cart.routes.js        # /api/cart
│   │   ├── category.routes.js    # /api/categories
│   │   ├── coupon.routes.js      # /api/coupons
│   │   ├── order.routes.js       # /api/orders
│   │   ├── product.routes.js     # /api/products
│   │   ├── review.routes.js      # /api/reviews & /api/products/:id/reviews
│   │   ├── user.routes.js        # /api/users
│   │   └── wishlist.routes.js    # /api/wishlist
│   ├── seed/
│   │   ├── index.js              # Master seed orchestrator
│   │   ├── seedAdmin.js          # Admin account seeder
│   │   ├── seedCategories.js     # Category seeder
│   │   └── seedProducts.js       # DummyJSON import & fallback catalog seeder
│   ├── services/
│   │   ├── email.service.js      # Order notification stubs
│   │   └── payment.service.js    # Modular payment gateway abstraction
│   ├── utils/
│   │   ├── apiResponse.js        # Standardized JSON response helpers
│   │   ├── asyncHandler.js       # Express async error boundary wrapper
│   │   ├── calculatePrice.js     # Pure calculation functions (discounts, tax, totals)
│   │   ├── generateToken.js      # JWT sign and cookie configuration
│   │   └── slugify.js            # Clean URL slug generation
│   ├── validators/
│   │   ├── auth.validator.js     # Joi auth & address schemas
│   │   ├── coupon.validator.js   # Joi coupon schemas
│   │   ├── order.validator.js    # Joi checkout & status schemas
│   │   └── product.validator.js  # Joi product, category & review schemas
│   ├── app.js                    # Express app configuration & route registry
│   └── server.js                 # HTTP listener & DB initiator
├── .env.example
├── .gitignore
├── package.json
├── postman_collection.json       # Ready-to-import Postman test collection
└── README.md
```

---

## 🗄 Database Schema & Relationships

```
User ─────────┬── Cart (1:1 per user)
              ├── Orders (1:N)
              ├── Reviews (1:N)
              ├── Wishlist (embedded Array of Product references)
              └── Addresses (embedded Subdocuments)

Product ──────┬── Category (N:1)
              └── Reviews (1:N)

Order ────────┬── User (N:1)
              └── OrderItems (Snapshot copy of product title, image, price, quantity)

Review ───────┬── User (N:1)
              └── Product (N:1 - Unique compound index ensures 1 review per user/product)

Coupon ─────── Evaluated dynamically during checkout and recorded inside Order
```

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [MongoDB](https://www.mongodb.com/) running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd backend(Ecommerce)
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Configure your parameters:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT Secret Keys & Expiration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_REFRESH_EXPIRES_IN=30d

# Cookie Security Secret
COOKIE_SECRET=your_cookie_secret_change_in_production

# Frontend Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: SMTP Email Service
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=noreply@ecommerce.com
```

---

## 🌱 Database Seeding

Populate the database with the default Admin user, full product categories, sample products (fetching live from DummyJSON with fallback to local curated datasets), and promo coupons:

```bash
# Run all seeders sequentially
npm run seed

# Or run individual seeders:
npm run seed:admin       # Creates default Admin account
npm run seed:categories  # Creates 10 default categories
npm run seed:products    # Imports 30+ products + promo coupons
```

### Default Admin Credentials
- **Email**: `admin@ecommerce.com`
- **Password**: `Admin@12345`

---

## 🏃 Running the Server

```bash
# Start in development mode (with hot-reload via nodemon)
npm run dev

# Start in production mode
npm start
```

When started, the server outputs:
```
🚀 Server running on port 5000 [development]
📡 API: http://localhost:5000/api
❤️  Health: http://localhost:5000/api/health
```

---

## 📚 API Endpoints Reference

### Health Check
- `GET /api/health` — Check server status.

---

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Login with email & password (returns token & sets cookie) |
| `POST` | `/api/auth/logout` | Authenticated | Logout user and clear tokens |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile |
| `POST` | `/api/auth/refresh` | Public | Rotate and issue new access token using refresh token |
| `PATCH` | `/api/auth/change-password` | Authenticated | Change user password |

---

### Users & Addresses (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/profile` | Authenticated | Get current user's profile |
| `PUT` | `/api/users/profile` | Authenticated | Update user's profile |
| `GET` | `/api/users/addresses` | Authenticated | List all shipping addresses |
| `POST` | `/api/users/addresses` | Authenticated | Add a new address |
| `PUT` | `/api/users/addresses/:id` | Authenticated | Update an address |
| `DELETE` | `/api/users/addresses/:id`| Authenticated | Remove an address |

---

### Products (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products with search, filters, sorting & pagination |
| `GET` | `/api/products/:id` | Public | Get product details by ID |
| `GET` | `/api/products/slug/:slug` | Public | Get product details by SEO-friendly slug |
| `POST` | `/api/products` | Admin Only | Create new product |
| `PUT` | `/api/products/:id` | Admin Only | Full product update |
| `PATCH` | `/api/products/:id` | Admin Only | Partial product update |
| `DELETE` | `/api/products/:id` | Admin Only | Delete product |

#### Query Parameters for `GET /api/products`:
- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `12`)
- `search`: Keyword search across `title`, `description`, `brand`, `tags`
- `category`: Filter by category name
- `brand`: Filter by brand name
- `minPrice` / `maxPrice`: Filter by calculated final price
- `minRating` / `maxRating`: Filter by customer rating
- `inStock`: Pass `true` to list in-stock items only
- `sort`: `price_asc` | `price_desc` | `rating` | `newest` | `oldest` | `popular`

---

### Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | List active categories |
| `GET` | `/api/categories/:id` | Public | Get category details |
| `POST` | `/api/categories` | Admin Only | Create a new category |
| `PUT` | `/api/categories/:id` | Admin Only | Update category |
| `DELETE` | `/api/categories/:id` | Admin Only | Delete category |

---

### Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Authenticated | Retrieve authenticated user's cart |
| `POST` | `/api/cart/items` | Authenticated | Add item to cart |
| `PUT` | `/api/cart/items/:productId` | Authenticated | Update item quantity |
| `DELETE` | `/api/cart/items/:productId` | Authenticated | Remove item from cart |
| `DELETE` | `/api/cart` | Authenticated | Clear cart |

---

### Wishlist (`/api/wishlist`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/wishlist` | Authenticated | Get bookmarked products |
| `POST` | `/api/wishlist/:productId` | Authenticated | Add product to wishlist |
| `DELETE` | `/api/wishlist/:productId` | Authenticated | Remove product from wishlist |

---

### Reviews (`/api/reviews` & `/api/products/:productId/reviews`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products/:productId/reviews` | Public | Get reviews for a product |
| `POST` | `/api/products/:productId/reviews` | Authenticated | Post a review (Verified purchasers only) |
| `PUT` | `/api/reviews/:id` | Authenticated | Update existing review (Owner only) |
| `DELETE` | `/api/reviews/:id` | Authenticated | Delete review (Owner or Admin) |

---

### Coupons (`/api/coupons`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/coupons/validate` | Authenticated | Validate coupon code against subtotal |
| `GET` | `/api/coupons` | Admin Only | List all promotional coupons |
| `POST` | `/api/coupons` | Admin Only | Create new coupon |
| `PUT` | `/api/coupons/:id` | Admin Only | Update coupon details |
| `DELETE` | `/api/coupons/:id` | Admin Only | Delete coupon |

---

### Orders & Checkout (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Authenticated | Checkout cart items & create order |
| `GET` | `/api/orders` | Authenticated | List current user's order history |
| `GET` | `/api/orders/:id` | Authenticated | View order details |
| `PATCH` | `/api/orders/:id/cancel` | Authenticated | Cancel pending order and restore stock |

---

### Admin (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin Only | Top-level summary (Revenue, Orders, Low Stock) |
| `GET` | `/api/admin/statistics` | Admin Only | Sales breakdown (`daily`, `weekly`, `monthly`, `yearly`) |
| `GET` | `/api/admin/users` | Admin Only | Paginated customer list |
| `GET` | `/api/admin/users/:id` | Admin Only | User details |
| `PATCH` | `/api/admin/users/:id` | Admin Only | Toggle user activation state |
| `PATCH` | `/api/admin/users/:id/role` | Admin Only | Promote / demote user role |
| `DELETE` | `/api/admin/users/:id` | Admin Only | Delete user |
| `GET` | `/api/admin/orders` | Admin Only | List all platform orders |
| `GET` | `/api/admin/orders/:id` | Admin Only | Detailed order inspection |
| `PATCH` | `/api/admin/orders/:id/status` | Admin Only | Update order & payment status |
| `GET` | `/api/admin/products` | Admin Only | Admin view of all products |

---

## 📐 Error Handling & Response Format

### Success Response Format
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "66ce...",
      "title": "iPhone 15 Pro Max",
      "slug": "iphone-15-pro-max",
      "price": 1199,
      "discountPercentage": 5,
      "finalPrice": 1139.05,
      "category": "electronics",
      "brand": "Apple",
      "stock": 50,
      "availabilityStatus": "In Stock",
      "rating": 4.8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "totalItems": 32,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      }
    ]
  }
}
```

---

## 📮 Postman Testing

A complete Postman Collection is included in the project root: `postman_collection.json`.

### How to use:
1. Open **Postman**.
2. Click **Import** and select `postman_collection.json`.
3. The collection variables (`baseUrl`, `accessToken`, `adminAccessToken`) are pre-configured.
4. Run the **Login User** or **Login Admin** request — tests will automatically capture and set the `accessToken` and `adminAccessToken` variables for subsequent protected calls!

---

## 💻 Frontend (React/Next.js) Integration Guide

### 1. Axios Instance Setup
```javascript
// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Needed if using HTTP-only cookies
});

// Attach Bearer token if stored in localStorage / state
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 2. Fetching Products Example
```jsx
// components/ProductList.jsx
import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?page=1&limit=12&sort=popular')
      .then((res) => {
        setProducts(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading catalog...</p>;

  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map((p) => (
        <div key={p._id} className="card p-4 border rounded shadow">
          <img src={p.thumbnail} alt={p.title} className="h-48 object-cover w-full" />
          <h3 className="font-bold text-lg mt-2">{p.title}</h3>
          <p className="text-gray-600 font-semibold">${p.finalPrice}</p>
          {p.discountPercentage > 0 && (
            <span className="text-sm text-red-500 line-through">${p.price}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 🚢 Deployment

### Render / Railway / AWS
1. Set the build command: `npm install`
2. Set the start command: `npm start`
3. Configure Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, etc.) in the hosting dashboard.
4. Run `npm run seed` once to initialize the database in production.

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
