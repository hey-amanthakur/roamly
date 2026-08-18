import { useContext, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Context } from "../../context/Context";
import { IMAGES_URL } from "../../config";
import "./topbar.css";

export default function TopBar() {
  const { user, dispatch, theme } = useContext(Context);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const history = useHistory();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      history.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  return (
    <div className={`top ${theme}`}>
      <div className="topLeft">
        <i className="topIcon fab fa-facebook-square"></i>
        <i className="topIcon fab fa-twitter-square"></i>
        <i className="topIcon fab fa-instagram-square"></i>
      </div>

      <div className={`topCenter ${mobileMenuOpen ? "open" : ""}`}>
        <ul className="topList">
          <li className="topListItem" onClick={() => setMobileMenuOpen(false)}>
            <Link className="link" to="/">
              HOME
            </Link>
          </li>
          <li className="topListItem" onClick={() => setMobileMenuOpen(false)}>
            <Link className="link" to="/trending">
              TRENDING
            </Link>
          </li>
          {user && (
            <>
              <li className="topListItem" onClick={() => setMobileMenuOpen(false)}>
                <Link className="link" to="/write">
                  WRITE
                </Link>
              </li>
              <li className="topListItem" onClick={() => setMobileMenuOpen(false)}>
                <Link className="link" to="/bookmarks">
                  BOOKMARKS
                </Link>
              </li>
              <li className="topListItem" onClick={() => setMobileMenuOpen(false)}>
                <Link className="link" to="/dashboard">
                  DASHBOARD
                </Link>
              </li>
            </>
          )}
          <li className="topListItem" onClick={handleLogout}>
            {user && "LOGOUT"}
          </li>
        </ul>
      </div>

      <div className="topRight">
        <div className="topSearch">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search..."
              className="topSearchInput"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="topSearchBtn">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>

        <button className="themeToggle" onClick={toggleTheme} title="Toggle theme">
          <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
        </button>

        {user ? (
          <Link to="/settings">
            <img
              className="topImg"
              src={
                user.profilePic
                  ? `${IMAGES_URL}/${user.profilePic}`
                  : `${IMAGES_URL}/default-avatar.png`
              }
              alt={user.username}
            />
          </Link>
        ) : (
          <ul className="topList topListAuth">
            <li className="topListItem">
              <Link className="link" to="/login">
                LOGIN
              </Link>
            </li>
            <li className="topListItem">
              <Link className="link" to="/register">
                REGISTER
              </Link>
            </li>
          </ul>
        )}

        <button
          className={`hamburger ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  );
}
