import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./Header.css";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const { count, updateCartCount } = useContext(CartContext);
  const [firstName, setFirstName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const searchWrapperRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/api/auth/profile/${user}`)
        .then((res) => res.json())
        .then((data) => setFirstName(data.firstName || ""))
        .catch(() => setFirstName(""));
    } else {
      setFirstName("");
      setShowDropdown(false);
    }
  }, [user, API_URL]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      fetch(`${API_URL}/api/products/search?q=${value}`)
        .then((res) => res.json())
        .then((products) => {
          const matches = products.filter((p) =>
            p.name.toLowerCase().includes(value.toLowerCase())
          );
          setSuggestions(matches.slice(0, 5));
        });
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSuggestions([]);
      setShowSearch(false);
    }
  };

  const handleSuggestionClick = (name) => {
    navigate(`/search?q=${encodeURIComponent(name)}`);
    setSearchQuery("");
    setSuggestions([]);
    setShowSearch(false);
  };

  const handleAddToCart = (productId) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetch(`${API_URL}/api/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user,
        productId,
        quantity: 1,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setSuggestions([]);
        updateCartCount();
      })
      .catch((err) => {
        console.error(" Add to cart failed:", err);
      });
  };

  return (
    <header className="main-header">
      <Link to="/" className="header-logo">MyGrocery</Link>

      <div
        className={`search-wrapper ${showSearch ? "expanded" : ""}`}
        ref={searchWrapperRef}
      >
        <img
          src="/Search.png"
          alt="Search"
          className="search-icon-only"
          onClick={() => setShowSearch((prev) => !prev)}
        />

        <input
          type="text"
          placeholder="Search"
          className="search-bar"
          value={searchQuery}
          onChange={handleSearch}
          onKeyDown={handleSearchKeyPress}
          style={{ display: showSearch ? "block" : "" }}
        />

        {suggestions.length > 0 && (
          <ul className="search-suggestions">
            {suggestions.map((item) => (
              <li key={item._id} className="suggestion-item">
                <span
                  onClick={() => handleSuggestionClick(item.name)}
                  className="product-name"
                >
                  {item.name}
                </span>
                <button
                  className="add-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(item._id);
                  }}
                >
                  add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="header-icons">
        <Link to="/cart" className="icon-link cart-icon-wrapper">
          <img src="/cart.png" alt="Cart" className="cart-icon" />
          {count > 0 && <span className="cart-badge">{count}</span>}
        </Link>

        <div className="user-menu">
          <div className="icon-link user-button" onClick={toggleDropdown}>
            <img src="/user.png" alt="User" className="user-icon" />
            {firstName}
          </div>

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
