import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./SearchResultsPage.css";

const SearchResultsPage = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { setCount } = useContext(CartContext);
  const query = new URLSearchParams(location.search).get("q") || "";

  const [results, setResults] = useState([]);
  const [originalResults, setOriginalResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("none");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (query) {
      fetch(`${API_URL}/api/products/search?q=${query}`)
        .then((res) => res.json())
        .then((data) => {
          setOriginalResults(data);
          setResults(data); // unsorted by default
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

    if (sortOrder === "asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      sorted.sort((a, b) => b.price - a.price);
    }

    setResults(sorted);
  }, [sortOrder, originalResults]);

  const handleAddToCart = async (product) => {
    if (!product.available) {
      alert("⚠️ This product is out of stock.");
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
        body: JSON.stringify({
          userId: user,
          productId: product._id,
          quantity: 1,
        }),
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
    <div className="search-results" style={{ padding: "2rem" }}>
      <h2>Search Results for “{query}”</h2>

      {/* 🔽 Sort Dropdown */}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="sort">Sort by Price: </label>
        <select
          id="sort"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="none">Default</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
      </div>

      <div className="product-grid">
        {results.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h4>{product.name}</h4>
            <p>${product.price.toFixed(2)}</p>
            <p>
              Availability:{" "}
              <span style={{ color: product.available ? "green" : "red" }}>
                {product.available ? "Available" : "Out of Stock"}
              </span>
            </p>

            <button
              className="add-btn"
              onClick={() => handleAddToCart(product)}
              disabled={!product.available}
              style={!product.available ? { backgroundColor: "gray", color: "#fff" } : {}}
            >
              {product.available ? "Add to Cart" : "Unavailable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPage;
