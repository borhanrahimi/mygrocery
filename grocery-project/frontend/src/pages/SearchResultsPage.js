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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      fetch(`/api/products/search?q=${query}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch search results:", err);
          setLoading(false);
        });
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  const handleAddToCart = async (productId) => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    try {
      await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user,
          productId,
          quantity: 1,
        }),
      });

      // Refresh cart count
      const res = await fetch(`/api/cart/${user}`);
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
      <div className="product-grid">
        {results.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h4>{product.name}</h4>
            <p>${product.price.toFixed(2)}</p>
            <button
              className="add-btn"
              onClick={() => handleAddToCart(product._id)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPage;
