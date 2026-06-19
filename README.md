# Tamarind Tales — E-commerce Website

Premium heritage art e-commerce for Tamarind Tales (@tamarindtaless).
Built with React, Firebase, Razorpay redirect, and Cloudinary.

---

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React 18, React Router v6     |
| Auth       | Firebase Auth (Google + Email)|
| Database   | Firestore                     |
| Storage    | Firebase Storage              |
| Payments   | Razorpay Payment Link redirect|
| Deployment | Vercel (free)                 |
| Images CDN | Firebase Storage              |

---

## Step 1 — Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g. `tamarind-tales`)
3. Add a **Web App** — copy the config object
4. Enable **Authentication**:
   - Sign-in methods: Email/Password ✓, Google ✓
   - Add your domain to Authorised Domains (add `localhost` for dev, your Vercel URL for prod)
5. Enable **Firestore Database** (production mode)
6. Enable **Storage** (for product image uploads)
7. Deploy Firestore rules: copy `firestore.rules` content into Firebase Console → Firestore → Rules

---

## Step 2 — Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

```env
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123:web:abc

REACT_APP_ADMIN_EMAIL=admin@tamarindtaless.com
REACT_APP_PAYMENT_URL=https://rzp.io/l/your-payment-link
```

**REACT_APP_ADMIN_EMAIL** — only this email gets admin access.
Use your Tamarind Tales admin email here.

**REACT_APP_PAYMENT_URL** — your Razorpay Payment Link URL.
Get this from Razorpay Dashboard → Payment Links → Create.
Complete KYC first (takes 3–7 days).

---

## Step 3 — Install & Run

```bash
npm install
npm start
```

App opens at http://localhost:3000

---

## Step 4 — Populate Products

Option A — Use Admin Panel (recommended):
1. Login with REACT_APP_ADMIN_EMAIL
2. Go to /admin → Products → Add New Product
3. Fill in all fields, upload images, save

Option B — Seed from code:
Products in `src/data/products.js` are the local fallback.
They display before Firestore loads and when Firebase is not configured.

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

Also add your Vercel domain to Firebase Auth → Authorised Domains.

---

## Product Fields Reference

| Field        | Type    | Description                                      |
|--------------|---------|--------------------------------------------------|
| name         | string  | Product name                                     |
| cat          | string  | bronze / wooden / paintings / brass / miniatures |
| subtitle     | string  | Short tagline                                    |
| origin       | string  | Region (e.g. "North Malabar, Kerala")            |
| material     | string  | Material description                             |
| dimensions   | string  | Size (e.g. '10" H x 4" W')                      |
| weight       | string  | Weight (e.g. "1.2 kg")                          |
| price        | number  | Price in Rs. — set null if enquiryOnly           |
| enquiryOnly  | boolean | true = hide price, show WhatsApp enquiry only    |
| stock        | number  | 0 = Sold Out, 1 = "Only 1 Left", 2+ = normal    |
| available    | boolean | false = hidden from shop entirely                |
| badge        | string  | Optional badge (Featured / Rare / Collector)     |
| images       | array   | Image URLs (uploaded via Admin Panel)            |
| story        | string  | Narrative about the piece                        |
| together     | string  | Collection context note                          |
| bg           | string  | CSS gradient fallback when no image              |

---

## Admin Panel

URL: `/admin`
Login: use REACT_APP_ADMIN_EMAIL account only

Features:
- Dashboard stats (products, orders, pending, enquiries)
- Products: add, edit, delete, toggle visibility
- Image upload direct to Firebase Storage
- Orders: view all, update status (Pending → Confirmed → Shipped → Delivered)
- Enquiries: view all customer email and WhatsApp enquiries

---

## Payment Flow

1. Customer adds items to cart
2. Must be logged in to proceed to checkout
3. Must enter or select a delivery address (mandatory)
4. Selects payment method:
   - **Online (Razorpay)** → redirects to REACT_APP_PAYMENT_URL
   - **WhatsApp** → order saved, WhatsApp opened with order details
5. Order saved to Firestore
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
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
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
│   │   └── AboutContact.jsx
│   ├── styles/
│   │   └── globals.css
│   ├── firebase.js
│   ├── App.jsx
│   └── index.js
├── firestore.rules
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
