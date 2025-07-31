import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ product, onAdd }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  const handleAdd = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/api/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.userId,
        productId: product._id,
        quantity: 1,
      }),
    })
      .then((res) => res.json())
      .then(() => onAdd())
      .catch((err) => {
        console.error("❌ Failed to add to cart:", err);
      });
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />

      <div className="product-info">
        <h4>{product.name}</h4>
        <p>${product.price.toFixed(2)}</p>
        <button
          onClick={handleAdd}
          disabled={product.stockQuantity === 0}
        >
          {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
