import React, { useState, useEffect } from "react";
import "./EditProfileModal.css";
import axios from "axios";

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");

  const API_URL = process.env.REACT_APP_API_URL;

  // Format phone as (210) 123 45-67
  const formatPhone = (input) => {
    const cleaned = input.replace(/\D/g, "").slice(0, 10);
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) return `(${match[1]}) ${match[2]} ${match[3]}-${match[4]}`;
    return input;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`${API_URL}/api/users/${user._id}`, {
        firstName,
        lastName,
        email,
        phoneNumber,
      });

      if (response.status === 200) {
        onSave(response.data); // Pass updated user to parent
        onClose(); // Close modal
      } else {
        alert("❌ Failed to update profile");
      }
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      alert("❌ Could not save changes");
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <h2>Edit Profile</h2>
        <div className="form-group">
          <label>First Name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input value={phoneNumber} onChange={handlePhoneChange} />
        </div>

        <div className="edit-modal-buttons">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
