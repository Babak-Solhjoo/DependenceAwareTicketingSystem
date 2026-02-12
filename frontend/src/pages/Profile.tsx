import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { profileStore } from "../store/profileStore";

const Profile = () => {
  const { profile, fetchProfile, saveProfile, uploadPhoto, loading, error } = profileStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    setPreview(profile.photoUrl);
    setPhotoFile(null);
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
  }, [profile]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const handleRemove = () => {
    setPreview(null);
    setPhotoFile(null);
    setRemovePhoto(true);
  };

  const handleSave = async () => {
    await saveProfile({ firstName, lastName });

    if (removePhoto) {
      await saveProfile({ photo: null });
      setRemovePhoto(false);
    }

    if (photoFile) {
      await uploadPhoto(photoFile);
      setPhotoFile(null);
    }
  };

  return (
    <div className="app-shell">
      <div className="page page-compact">
        <TopBar />
        <div className="profile-card glass after-header">
          <h3>Profile</h3>
          <p className="muted">Save to update your profile details.</p>
          <div className="profile-fields">
            <div className="input-group">
              <label htmlFor="profile-first">Name</label>
              <input
                id="profile-first"
                className="profile-input"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="profile-last">Surname</label>
              <input
                id="profile-last"
                className="profile-input"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>
          <div className="profile-media">
            <div className="profile-preview">
              {preview ? <img src={preview} alt="Profile" /> : <span>No photo</span>}
            </div>
            <div className="profile-media-actions">
              <p className="muted">Upload a square photo for best results.</p>
              <input type="file" accept="image/*" onChange={handleUpload} />
              <button type="button" className="secondary button-tall" onClick={handleRemove}>
                Remove photo
              </button>
            </div>
          </div>
          {error && <div className="notice">{error}</div>}
          <button
            type="button"
            className="button-short button-half profile-save"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
