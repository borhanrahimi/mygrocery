import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import CategoryPage from "./pages/CategoryPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import SearchResultsPage from "./pages/SearchResultsPage"; // ✅ updated
import { RequireLogin } from "./components/RequireLogin";
import "./App.css";


function App() {
  return (
    <Router>
      <Header />
      <main className="home-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<LoginRegisterPage />} />

          {/* Protected Routes */}
          <Route path="/profile" element={<RequireLogin><ProfilePage /></RequireLogin>} />
          <Route path="/cart" element={<RequireLogin><CartPage /></RequireLogin>} />
          <Route path="/orders" element={<RequireLogin><OrderHistoryPage /></RequireLogin>} />
          <Route path="/category/:categoryName" element={<RequireLogin><CategoryPage /></RequireLogin>} />
          <Route path="/checkout-success" element={<RequireLogin><CheckoutSuccessPage /></RequireLogin>} />
          <Route path="/search" element={<SearchResultsPage/>} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={<h2 style={{ color: "red" }}>❌ Page Not Found</h2>}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
