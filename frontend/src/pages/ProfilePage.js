import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import EditProfileModal from "../components/EditProfileModal";
import SavedCardBox from "../components/SavedCardBox";
import "./ProfilePage.css";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!user || !user.userId) return;

    fetch(`${API_URL}/api/auth/profile/${user.userId}`)
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error("❌ Failed to load profile:", err));
  }, [user, API_URL]);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="profile-page">
      <h2>👤 My Profile</h2>

      <div className="profile-info">
        <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>

        <p><strong>Address:</strong></p>
        <p>{profile.address?.street}</p>
        <p>{profile.address?.city}, {profile.address?.state} {profile.address?.zip}</p>
      </div>

      <button className="edit-btn" onClick={() => setShowModal(true)}>
        Edit Profile
      </button>

      {showModal && (
        <EditProfileModal
          userId={user.userId}
          onClose={() => setShowModal(false)}
          onUpdate={() => window.location.reload()}
        />
      )}

      <SavedCardBox userId={user.userId} />
    </div>
  );
}

export default ProfilePage;
