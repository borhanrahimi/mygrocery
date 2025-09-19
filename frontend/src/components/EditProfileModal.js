import React, { useEffect, useState } from "react";
import "../Styling/EditProfileModal.css";

function EditProfileModal({ userId, section, onClose, onUpdate }) {
  const [formData, setFormData] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load profile:", err);
        setLoading(false);
      });
  }, [userId, API_URL]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      if (section === "address") {
        return {
          ...prev,
          address: {
            ...prev.address,
            [field]: value,
          },
        };
      } else {
        return {
          ...prev,
          [field]: value,
        };
      }
    });
  };

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = () => {
    if (
      section === "personal" &&
      (newPassword || confirmPassword || currentPassword)
    ) {
      if (!currentPassword) {
        alert("❌ Please enter your current password.");
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("❌ New passwords do not match.");
        return;
      }
    }

    const updatedData =
      section === "address"
        ? { address: formData.address }
        : {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            ...(newPassword && currentPassword && {
              currentPassword,
              newPassword,
            }),
          };

    fetch(`${API_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      })
      .then((res) => {
        alert(res.message || "✅ Profile updated successfully.");
        onUpdate(updatedData);
        onClose(); // ✅ Don't log out
      })
      .catch((err) => {
        console.error("❌ Error updating profile:", err.message);
        alert("❌ Failed to update profile.");
      });
  };

  if (loading || !formData) return <div className="modal">Loading...</div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit {section === "address" ? "Address" : "Personal Info"}</h2>
        {section === "address" ? (
          <>
            <input
              placeholder="Street"
              value={formData.address?.street || ""}
              onChange={(e) => handleChange("street", e.target.value)}
            />
            <input
              placeholder="City"
              value={formData.address?.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
            />
            <input
              placeholder="State"
              value={formData.address?.state || ""}
              onChange={(e) => handleChange("state", e.target.value)}
            />
            <input
              placeholder="Zip"
              value={formData.address?.zip || ""}
              onChange={(e) => handleChange("zip", e.target.value)}
            />
          </>
        ) : (
          <>
            <input
              placeholder="First Name"
              value={formData.firstName || ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
            <input
              placeholder="Last Name"
              value={formData.lastName || ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />
            <input
              placeholder="Phone"
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <input
              placeholder="Email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            {/* 🔐 Password Fields */}
            <div className="password-field">
              <input
                type={showPasswords.current ? "text" : "password"}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button onClick={() => toggleVisibility("current")}>
                {showPasswords.current ? "Hide" : "Show"}
              </button>
            </div>
            <div className="password-field">
              <input
                type={showPasswords.new ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button onClick={() => toggleVisibility("new")}>
                {showPasswords.new ? "Hide" : "Show"}
              </button>
            </div>
            <div className="password-field">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button onClick={() => toggleVisibility("confirm")}>
                {showPasswords.confirm ? "Hide" : "Show"}
              </button>
            </div>
          </>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
