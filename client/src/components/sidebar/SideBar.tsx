import { useState, useEffect, useRef, FormEvent } from "react";
import { SOCIAL_LINKS, AUTHOR } from "../../constants";
import "./sidebar.css";

export default function SideBar() {
  const [email, setEmail] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubscribe = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      timerRef.current = setTimeout(() => setSubscribed(false), 3000);
    }
  };
  return (
    <aside className="sidebar">
      <div className="sideAbout">
        <img
          className="sideAvatar"
          src={SOCIAL_LINKS.avatar}
          alt={AUTHOR.name}
          loading="lazy"
        />
        <h3 className="sideName">{AUTHOR.name}</h3>
        <p className="sideBio">
          {AUTHOR.bio}
        </p>
        <div className="sideSocial">
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noreferrer" className="sideSocialLink" data-platform="github" aria-label="GitHub">
            <i className="fab fa-github"></i>
          </a>
          <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="sideSocialLink" data-platform="twitter" aria-label="Twitter">
            <i className="fab fa-twitter"></i>
          </a>
          <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="sideSocialLink" data-platform="linkedin" aria-label="LinkedIn">
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="sideSocialLink" data-platform="instagram" aria-label="Instagram">
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
