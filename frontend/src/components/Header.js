import React, { useContext, useEffect, useState } from "react";
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
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetch(`/api/auth/profile/${user}`)
        .then((res) => res.json())
        .then((data) => setFirstName(data.firstName || ""))
        .catch(() => setFirstName(""));
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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      fetch("/api/products")
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
    }
  };

  const handleSuggestionClick = (name) => {
    navigate(`/search?q=${encodeURIComponent(name)}`);
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleAddToCart = (productId) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetch("/api/cart/add", {
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
        updateCartCount(); // ⬅️ instantly refresh cart count
      })
      .catch((err) => {
        console.error("❌ Add to cart failed:", err);
      });
  };

  return (
    <header className="main-header">
      <Link to="/" className="header-logo">Mygrocery</Link>

      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search"
          className="search-bar"
          value={searchQuery}
          onChange={handleSearch}
          onKeyDown={handleSearchKeyPress}
        />
        {suggestions.length > 0 && (
          <ul className="search-suggestions">
            {suggestions.map((item) => (
              <li key={item._id} className="suggestion-item">
                <span onClick={() => handleSuggestionClick(item.name)} className="product-name">
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
