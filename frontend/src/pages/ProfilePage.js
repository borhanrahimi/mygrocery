import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import EditProfileModal from "../components/EditProfileModal";
import "../Styling/ProfilePage.css";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [selectedTab, setSelectedTab] = useState("account");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!user?.userId) return;
    fetch(`${API_URL}/api/auth/profile/${user.userId}`)
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error("❌ Failed to load profile:", err));
  }, [user, API_URL]);

  const handleUpdate = (updatedData) => {
    setProfile((prev) => ({
      ...prev,
      ...updatedData,
      address: {
        ...prev.address,
        ...(updatedData.address || {}),
      },
    }));
    setShowModal(false);
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <h3>Account</h3>
        <ul>
          <li
            className={selectedTab === "account" ? "active" : ""}
            onClick={() => setSelectedTab("account")}
          >
            Profile
          </li>
          <li
            className={selectedTab === "payment" ? "active" : ""}
            onClick={() => setSelectedTab("payment")}
          >
            Payment
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="profile-main">
        {selectedTab === "account" && (
          <>
            {/* Personal Info */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Personal Information</h3>
                <span
                  className="edit-link"
                  onClick={() => {
                    setEditSection("personal");
                    setShowModal(true);
                  }}
                >
                  edit &gt;
                </span>
              </div>
              <div className="info-grid">
                <div><strong>First Name</strong><p>{profile.firstName}</p></div>
                <div><strong>Last Name</strong><p>{profile.lastName}</p></div>
                <div><strong>Phone</strong><p>{profile.phone}</p></div>
                <div><strong>Email</strong><p>{profile.email}</p></div>
                <div><strong>Password</strong><p>••••••••</p></div>
              </div>
            </div>

            {/* Address */}
            <div className="profile-card">
              <div className="card-header">
                <h3>Address</h3>
                <span
                  className="edit-link"
                  onClick={() => {
                    setEditSection("address");
                    setShowModal(true);
                  }}
                >
                  edit &gt;
                </span>
              </div>
              <div className="info-grid">
                <div><strong>Street</strong><p>{profile.address?.street || "-"}</p></div>
                <div><strong>Zip Code</strong><p>{profile.address?.zip || "-"}</p></div>
                <div><strong>State</strong><p>{profile.address?.state || "-"}</p></div>
                <div><strong>City</strong><p>{profile.address?.city || "-"}</p></div>
              </div>
            </div>
          </>
        )}

        {selectedTab === "payment" && (
          <div className="profile-card">
            <div className="card-header">
              <h3>Payment Method</h3>
              <span
                className="edit-link"
                onClick={() => {
                  setEditSection("payment");
                  setShowModal(true);
                }}
              >
                edit &gt;
              </span>
            </div>
            <div className="info-grid">
              <div>
                <strong>Card</strong>
                <p>{profile.paymentMethod || "No card saved"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <EditProfileModal
          userId={user.userId}
          section={editSection}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

export default ProfilePage;
