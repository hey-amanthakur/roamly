import { useContext, useState, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { Context } from "../../context/Context";
import { IMAGES_URL } from "../../config";
import { DEFAULT_AVATAR } from "../../constants";
import { ContextValue } from "../../types";

export default function TopBar() {
  const { user, dispatch, theme } = useContext(Context) as ContextValue;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const history = useHistory();

  const handleLogout = (): void => {
    dispatch({ type: "LOGOUT" });
    setMobileMenuOpen(false);
    history.push("/");
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      history.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const toggleTheme = (): void => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  return (
    <div className={`top ${theme}`}>
      <div className="topLeft">
        <Link to="/" className="topLogo">
          <span className="logo-dot"></span>
          roamly
        </Link>
      </div>

      <div className={`topCenter ${mobileMenuOpen ? "open" : ""}`}>
        <ul className="topList">
          <li className="topListItem" onClick={() => setMobileMenuOpen(false)}>
            <Link className="link" to="/trending">
              Trending
            </Link>
          </li>
          {user && (
            <>
              <li className="topListItem" onClick={() => setMobileMenuOpen(false)}>
                <Link className="link" to="/write">
                  Write
                </Link>
              </li>
              <li className="topListItem" onClick={() => setMobileMenuOpen(false)}>
                <Link className="link" to="/bookmarks">
                  Bookmarks
                </Link>
              </li>
              <li className="topListItem" onClick={() => setMobileMenuOpen(false)}>
                <Link className="link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
            </>
          )}
          {user && (
            <li className="topListItem" onClick={handleLogout}>
              Logout
            </li>
          )}
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
           <Link to="/settings" className="topImgContainer">
             {user.profilePic ? (
               <img
                 className="topImg"
                src={`${IMAGES_URL}/${user.profilePic}`}
                alt={user.username}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== `${IMAGES_URL}/${DEFAULT_AVATAR}`) {
                    target.src = `${IMAGES_URL}/${DEFAULT_AVATAR}`;
                  } else {
                    // Replace broken image with a fallback icon element entirely
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="topImgPlaceholder"><i class="fas fa-user"></i></div>`;
                    }
                  }
                }}

               />
             ) : (
               <div className="topImgPlaceholder">
                 <i className="fas fa-user"></i>
               </div>
             )}
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
