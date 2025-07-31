import React, { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "../Styling/SearchResultsPage.css";

function SearchResultsPage() {
  const [results, setResults] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const location = useLocation();
  const { addToCart } = useContext(CartContext);

  const query = new URLSearchParams(location.search).get("q");
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (query) {
      fetch(`${API_URL}/api/products/search?q=${query}`)
        .then((res) => res.json())
        .then((data) => setResults(data))
        .catch((err) => {
          console.error("❌ Failed to fetch search results:", err);
          alert("❌ Could not load search results");
        });
    }
  }, [query, API_URL]);

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="search-results-page">
      <div className="search-header">
        <div className="result-count">{results.length} results</div>
        <h2 className="search-title">Results for "{query}"</h2>
        <div className="sort-dropdown">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Sort by</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      <div className="product-grid">
        {sortedResults.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
            <button
              className="add-btn"
              onClick={() => addToCart(product._id, product.stockQuantity)}
              disabled={product.stockQuantity === 0}
            >
              {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchResultsPage;
