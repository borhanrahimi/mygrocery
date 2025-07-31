import React, { useEffect, useState } from "react";
import "./SavedCardBox.css";

const SavedCardBox = ({ userId }) => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!userId) return;

    fetch(`${API_URL}/api/payments/saved-card/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.brand) {
          setCard(data);
        } else {
          setCard(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch saved card:", err);
        setLoading(false);
      });
  }, [userId, API_URL]);

  if (loading) return <p>Loading saved card...</p>;

  return (
    <div className="saved-card-box">
      <h4>💳 Saved Payment Method</h4>
      {card ? (
        <div className="card-info">
          <p>{card.brand} •••• {card.last4}</p>
          <p>Expires {card.exp_month}/{card.exp_year}</p>
          <button className="replace-btn" disabled>
            Replace Card (Coming Soon)
          </button>
        </div>
      ) : (
        <p>No saved card found.</p>
      )}
    </div>
  );
};

export default SavedCardBox;
