import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext"; // ✅ added
import "./Header.css";

function Header() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const { count } = useContext(CartContext); // ✅ get cart count

  return (
    <header className="main-header">
      <Link to="/" className="header-logo">Mygrocery</Link>

      <input type="text" placeholder="search" className="search-bar" />

      <div className="header-icons">
        <Link to="/cart" className="icon-link cart-icon-wrapper">
          🛒
          {count > 0 && <span className="cart-badge">{count}</span>} {/* ✅ badge */}
        </Link>
        {userId ? (
          <span className="icon-link" onClick={() => navigate("/auth")}>👤</span>
        ) : (
          <Link to="/auth" className="icon-link">👤</Link>
        )}
      </div>
    </header>
  );
}

export default Header;
