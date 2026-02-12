import { Link } from "react-router-dom";
import { useEffect } from "react";
import { authStore } from "../store/authStore";
import { profileStore } from "../store/profileStore";

const TopBar = () => {
  const user = authStore((state) => state.user);
  const logout = authStore((state) => state.logout);
  const { profile, fetchProfile } = profileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const displayName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <div className="top-bar glass">
      <div>
        <h2>Task Scheduler</h2>
      </div>
      <nav className="top-nav">
        <Link to="/tasks">Tasks</Link>
        <Link to="/stats">Stats</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/profile">Profile</Link>
      </nav>
      <details className="about-menu">
        <summary className="about-summary">About</summary>
        <div className="about-panel">
          <ul className="about-list">
            <li>Developer: Babak Solhjoo</li>
            <li>Email: Babak.Solhjoo@hotmail.com</li>
            <li>Version: 1.0</li>
          </ul>
        </div>
      </details>
      <div className="top-user">
        <div className="avatar-stack">
          <div className="avatar">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt="Profile" />
            ) : (
              <span>{user?.email?.[0] ?? "U"}</span>
            )}
          </div>
          <span className="avatar-name">{displayName || "Profile"}</span>
        </div>
      </div>
      <button className="secondary top-logout" onClick={logout}>
        Log out
      </button>
    </div>
  );
};

export default TopBar;
