# Tamarind Taless — E-commerce Website

Premium heritage art e-commerce for Tamarind Taless (@tamarindtaless).
Built with React, Supabase, Razorpay redirect, and Cloudinary.

---

## Tech Stack

| Layer      | Technology                       |
|------------|-----------------------------------|
| Frontend   | React 18, React Router v6         |
| Auth       | Supabase Auth (Google + Email)    |
| Database   | Supabase (Postgres)               |
| Images CDN | Cloudinary                        |
| Payments   | Razorpay Payment Link redirect    |
| Deployment | Vercel (free)                     |

---

## Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Under **Project Settings → API**, copy the Project URL and anon public key
3. Create the following tables: `profiles`, `products`, `orders`, `enquiries`, `stories`, `settings`
4. Enable **Authentication** providers: Email/Password and Google
5. Set up Row Level Security (RLS) policies so:
   - Products are publicly readable, writable only by the admin account
   - Orders/enquiries are readable by their owner and the admin account
   - Profiles are readable/writable only by their owner

---

## Step 2 — Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

REACT_APP_ADMIN_EMAIL=admin@tamarindtaless.com

RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

**REACT_APP_ADMIN_EMAIL** — only this email gets admin access.
Use your Tamarind Taless admin email here.

**RAZORPAY_KEY_ID** / **RAZORPAY_KEY_SECRET** — from Razorpay Dashboard → Settings → API Keys.
No `REACT_APP_` prefix on either — both are read only by the serverless
functions in `/api`, which create the payment order and verify the payment
signature server-side before an order is ever marked "Paid". Complete KYC
first (takes 3–7 days) to get live keys; test keys work immediately for
development.

---

## Step 3 — Install & Run

```bash
npm install
npm start
```

App opens at http://localhost:3000

---

## Step 4 — Populate Products

Products are managed entirely via the Admin Panel — there is no local seed data.
1. Login with REACT_APP_ADMIN_EMAIL at `/admin/login`
2. Go to Admin Panel → Add Product
3. Fill in all fields, upload images, save

Category taxonomy lives in `src/data/products.js` (`categories` / `CATEGORY_GROUPS`) and drives both the Navbar mega-menu and the Shop filter bar.

---

## Step 5 — Deploy to Vercel

```bash
npm install -g vercel
vercel
```

When prompted:
- Framework: Create React App
- Build command: `npm run build`
- Output dir: `build`

Add all `.env` variables in Vercel Dashboard → Settings → Environment Variables.

Also add your Vercel domain to Supabase → Authentication → URL Configuration.

---

## Product Fields Reference

| Field        | Type    | Description                                              |
|--------------|---------|------------------------------------------------------------|
| name         | string  | Product name                                              |
| cat          | string  | One of the categories in `src/data/products.js`           |
| subtitle     | string  | Short tagline                                              |
| origin       | string  | Region (e.g. "North Malabar, Kerala")                      |
| material     | string  | Material description                                       |
| dimensions   | string  | Size (e.g. '10" H x 4" W')                                 |
| weight       | string  | Weight (e.g. "1.2 kg")                                      |
| price        | number  | Price in Rs. — set null if enquiry_only                    |
| enquiry_only | boolean | true = hide price, show WhatsApp enquiry only               |
| stock        | number  | 0 = Sold Out, 1 = "Only 1 Left", 2+ = normal                |
| available    | boolean | false = hidden from shop entirely                           |
| badge        | string  | Optional badge (Featured / Rare / Collector)                |
| images       | array   | Image URLs (uploaded via Admin Panel)                       |
| story        | string  | Narrative about the piece                                   |
| together     | string  | Collection context note                                     |
| bg           | string  | CSS gradient fallback when no image                          |

---

## Admin Panel

URL: `/admin`
Login: use REACT_APP_ADMIN_EMAIL account only

Features:
- Dashboard stats (products, orders, pending, enquiries)
- Products: add, edit, delete, toggle visibility
- Image upload direct to Cloudinary
- Orders: view all, update status (Pending → Confirmed → Shipped → Delivered)
- Enquiries: view all customer email and WhatsApp enquiries
- Stories: publish/manage the Stories & Blog page
- Brand Settings: logo, brand name, per-page hero images

---

## Payment Flow

1. Customer adds items to cart
2. Can check out as a guest, or logged in
3. Must enter or select a delivery address (mandatory)
4. Selects payment method:
   - **Online (Razorpay)** → `api/razorpay-create-order` creates a real Razorpay
     order server-side, the Razorpay Checkout widget opens in the browser, and
     on success `api/razorpay-verify-payment` verifies the payment signature
     server-side before anything is saved. The order is only ever written to
     Supabase — with `status: "Paid"` and the real payment ID — after that
     verification succeeds. If the widget is cancelled, the payment fails, or
     verification fails, no order is created.
   - **WhatsApp** → order saved immediately with `status: "Pending"`, WhatsApp
     opened with order details, payment arranged manually
5. Order saved to Supabase
6. Seller receives WhatsApp notification automatically

---

## Folder Structure

```
tamarind-taless/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── PageHero.jsx
│   │   ├── ImageUploader.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── BrandContext.jsx
│   │   └── CartContext.jsx
│   ├── data/
│   │   └── products.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Confirmation.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Account.jsx
│   │   ├── Admin.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AboutContact.jsx
│   ├── styles/
│   │   └── globals.css
│   ├── supabase.js
│   ├── App.jsx
│   └── index.js
├── package.json
├── .env.example
└── README.md
```

---

## Contacts

Seller WhatsApp: +91 87969 88216
Instagram: @tamarindtaless
Locations: Noida and Coimbatore, India

Built by: Yuvaraj S, AI Engineer, UK Textiles Pvt Ltd
