import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { RequireLogin } from "./components/RequireLogin";
import "./App.css";

function App() {
  return (
    <Router>
      <Header />
      <main className="home-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ✅ Protected Routes */}
          <Route path="/profile" element={<RequireLogin><ProfilePage /></RequireLogin>} />
          <Route path="/cart" element={<RequireLogin><CartPage /></RequireLogin>} />
          <Route path="/orders" element={<RequireLogin><OrderHistoryPage /></RequireLogin>} />
          <Route path="/checkout-success" element={<RequireLogin><CheckoutSuccessPage /></RequireLogin>} />

          {/* ✅ Search route */}
          <Route path="/search" element={<SearchResultsPage />} />

          {/* ✅ Custom 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
