import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetch(`/api/auth/profile/${userId}`)
        .then((res) => res.json())
        .then(setUser)
        .catch((err) => {
          console.error("❌ Failed to load profile:", err);
        });
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/auth");
  };

  if (!userId) {
    return <p>Please <a href="/auth">log in</a> to view your profile.</p>;
  }

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Your Profile</h2>
      <p><strong>First Name:</strong> {user.firstName}</p>
      <p><strong>Last Name:</strong> {user.lastName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <p><strong>Address:</strong> {user.address || "N/A"}</p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "2rem",
          padding: "0.75rem 1rem",
          backgroundColor: "crimson",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default ProfilePage;
