# MyGrocery – Online Grocery Shopping App

A full-stack grocery shopping application that allows users to browse products, add items to their cart, apply discounts, and securely checkout using Stripe. Built for UTSA's Software Engineering project.

---

## Final Project – CS3773 Software Engineering  
**Team Members:**
- Borhan Rahimi  
- Ashley Salas Balladares  
- Camron Rankin  
- Michael O’Callaghan  
- Roman Elijah Trevizo  

**GitHub Repository:**  
https://github.com/borhanrahimi/mygrocery

---

## Features

### User Account
- Register and log in
- Edit personal details (name, phone, address, password)
- Stay logged in across sessions

### Product Catalog
- Browse all products on homepage
- Filter by category (e.g. Fruits, Bakery, Meat)
- Sort by name or price
- View out-of-stock items

### Cart & Checkout
- Add/remove items from cart
- Choose delivery option (standard or express)
- Apply student discount code
- Full price breakdown: subtotal, discount, tax, delivery fee, total
- Secure card payment with Stripe

### Orders
- View order history
- See past order details (items, prices, date)
- Shipping address shown per order
- Payment method and delivery info

---

## Tech Stack

| Frontend | Backend | Database | Payment | Hosting |
|----------|---------|----------|---------|---------|
| React.js | Node.js + Express | MongoDB Atlas | Stripe API | Vercel (frontend), Render (backend) |

---
## Project Structure
mygrocery/
├── frontend/ # React.js client
├── backend/ # Express API + MongoDB
├── screenshots/ # UI screenshots (for README)
├── .env # (gitignored) API keys
├── README.md # You are here!


---

## How to Run Locally

### 1. Clone the repository
git clone https://github.com/borhanrahimi/mygrocery
cd mygrocery


2. Backend Setup

cd backend
npm install
npm run dev

Create a .env file in /backend:
PORT=5000
MONGO_URI=your_mongo_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key

3. Frontend Setup
cd frontend
npm install
npm start

Create a .env file in /frontend:
REACT_APP_API_URL=http://localhost:5000


