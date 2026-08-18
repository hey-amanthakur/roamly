import { useState } from "react";
import "./sidebar.css";

export default function SideBar() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };
  return (
    <aside className="sidebar">
      <div className="sideAbout">
        <img
          className="sideAvatar"
          src="https://avatars.githubusercontent.com/u/amanthakur"
          alt="Aman Thakur"
          loading="lazy"
        />
        <h3 className="sideName">Aman Thakur</h3>
        <p className="sideBio">
          Full-stack developer & travel enthusiast. Building apps by day, exploring cities by weekend.
        </p>
        <div className="sideSocial">
          <a href="https://github.com/amanthakur" target="_blank" rel="noreferrer" className="sideSocialLink" data-platform="github" aria-label="GitHub">
            <i className="fab fa-github"></i>
          </a>
          <a href="https://twitter.com/amanthakur" target="_blank" rel="noreferrer" className="sideSocialLink" data-platform="twitter" aria-label="Twitter">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://linkedin.com/in/amanthakur" target="_blank" rel="noreferrer" className="sideSocialLink" data-platform="linkedin" aria-label="LinkedIn">
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a href="https://instagram.com/amanthakur" target="_blank" rel="noreferrer" className="sideSocialLink" data-platform="instagram" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>

      <div className="sideNewsletter">
        <h4 className="sideNewsTitle">
          <i className="fas fa-envelope"></i>
          Newsletter
        </h4>
        <p>Stories delivered to your inbox weekly.</p>
        {subscribed ? (
          <div className="sideNewsSuccess">
            <i className="fas fa-check-circle"></i>
            Subscribed!
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="sideNewsForm">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
            <button type="submit">
              <i className="fas fa-arrow-right"></i>
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
