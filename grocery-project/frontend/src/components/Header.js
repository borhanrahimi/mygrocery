import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./Header.css";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const { count } = useContext(CartContext);
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetch(`/api/auth/profile/${user}`)
        .then((res) => res.json())
        .then((data) => setFirstName(data.firstName || ""))
        .catch((err) => {
          console.error("❌ Failed to load user name:", err);
          setFirstName("");
        });
    }
  }, [user]);

  const handleUserClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="main-header">
      <Link to="/" className="header-logo">Mygrocery</Link>

      <input type="text" placeholder="Search" className="search-bar" />

      <div className="header-icons">
        <Link to="/cart" className="icon-link cart-icon-wrapper">
          🛒
          {count > 0 && <span className="cart-badge">{count}</span>}
        </Link>

        {user ? (
          <>
            <span className="icon-link user-info" onClick={handleUserClick}>
              👤 {firstName}
            </span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/auth" className="icon-link">👤</Link>
        )}
      </div>
    </header>
  );
}

export default Header;
