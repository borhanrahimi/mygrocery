import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./Header.css";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const { count } = useContext(CartContext);
  const [firstName, setFirstName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
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
    } else {
      setFirstName("");
      setShowDropdown(false);
    }
  }, [user]);

  const toggleDropdown = () => {
    if (user) {
      setShowDropdown((prev) => !prev);
    } else {
      navigate("/auth");
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setShowDropdown(false);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
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

        <div className="user-menu">
          <span className="icon-link user-button" onClick={toggleDropdown}>
            👤 {firstName}
          </span>

          {showDropdown && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => handleNavigate("/profile")}>
                Profile
              </button>
              <button className="dropdown-item" onClick={() => handleNavigate("/orders")}>
                Order History
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
