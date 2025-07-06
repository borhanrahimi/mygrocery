import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import CategoryPage from "./pages/CategoryPage";
import "./App.css";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";


function App() {
  return (
    <Router>
      <Header />
      <main className="home-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/auth" element={<LoginRegisterPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="*" element={<h2 style={{ color: "red" }}>Page Not Found</h2>} />
          <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
        </Routes>
      </main>
    </Router>
  );
}


export default App;