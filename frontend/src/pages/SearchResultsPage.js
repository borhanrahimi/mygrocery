import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./HomePage.css";

const SearchResultsPage = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { setCount } = useContext(CartContext);
  const query = new URLSearchParams(location.search).get("q") || "";

  const [results, setResults] = useState([]);
  const [originalResults, setOriginalResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("default");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (query) {
      fetch(`${API_URL}/api/products/search?q=${query}`)
        .then((res) => res.json())
        .then((data) => {
          setOriginalResults(data);
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch search results:", err);
          setLoading(false);
        });
    } else {
      setOriginalResults([]);
      setResults([]);
      setLoading(false);
    }
  }, [query, API_URL]);

  useEffect(() => {
    let sorted = [...originalResults];
    if (sortOrder === "price-low-high") sorted.sort((a, b) => a.price - b.price);
    else if (sortOrder === "price-high-low") sorted.sort((a, b) => b.price - a.price);
    else if (sortOrder === "a-z") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortOrder === "z-a") sorted.sort((a, b) => b.name.localeCompare(a.name));
    setResults(sorted);
  }, [sortOrder, originalResults]);

  const handleAddToCart = async (product) => {
    if (!product.available) {
      alert("This product is out of stock.");
      return;
    }
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    try {
      await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user, productId: product._id, quantity: 1 }),
      });

      const res = await fetch(`${API_URL}/api/cart/${user}`);
      const data = await res.json();
      const totalItems = data.items?.reduce((acc, item) => acc + item.quantity, 0);
      setCount(totalItems || 0);
    } catch (err) {
      console.error("❌ Add to cart failed:", err);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  if (!results.length) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>No results found for “{query}”</h2>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ padding: "2rem" }}>
      <div className="search-header-bar">
        <div className="result-count">
          <strong>{results.length}</strong> result{results.length !== 1 ? "s" : ""}
        </div>
        <h2 className="search-query-text">“{query}”</h2>
        <div className="sort-section">
          <label htmlFor="sortSelect" className="sort-label">Sort by</label>
          <select
            id="sortSelect"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-dropdown"
          >
            <option value="default">Best Match</option>
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      <hr className="search-divider" />

      <div className="product-grid">
        {results.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.image} alt={product.name} className="product-img" />
            <h4>{product.name}</h4>
            <p>${product.price.toFixed(2)}</p>
            <p className="availability">
              {product.stockQuantity > 0 ? "Available" : "Out of Stock"}
            </p>
            <button
              className={product.stockQuantity > 0 ? "add-button" : "add-button disabled"}
              disabled={product.stockQuantity === 0}
              onClick={() => handleAddToCart(product)}
            >
              {product.stockQuantity > 0 ? "Add to Cart" : "Unavailable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPage;
