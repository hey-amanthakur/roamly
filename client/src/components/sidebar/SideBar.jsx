import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../config";
import Newsletter from "../newsletter/Newsletter";

const FEATURED_CATEGORIES = [
  { key: "travel", label: "Travel", icon: "🌍" },
  { key: "food", label: "Food", icon: "🍜" },
  { key: "code", label: "Code", icon: "💻" },
];

export default function SideBar() {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    const getCats = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories`);
        setCats(res.data);
      } catch (err) {
        console.error("Failed to load categories");
      }
    };
    getCats();
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebarItem">
        <span className="sidebarTitle">About Me</span>
        <img
          src="https://avatars.githubusercontent.com/u/54764701?v=4"
          alt="Aman Thakur"
        />
        <p>Full-stack developer exploring the world through code, food, and travel.</p>
      </div>

      <div className="sidebarItem">
        <span className="sidebarTitle">Categories</span>
        <div className="categoryChips" style={{ padding: "0 8px", justifyContent: "center" }}>
          {FEATURED_CATEGORIES.map((cat) => (
            <Link key={cat.key} to={`/?cat=${cat.key}`}>
              <button className="categoryChip" data-cat={cat.key}>
                <span className="chipIcon">{cat.icon}</span>
                {cat.label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {cats.length > 0 && (
        <div className="sidebarItem">
          <span className="sidebarTitle">All Categories</span>
          <ul className="sidebarList">
            {cats.map((c) => (
              <Link key={c._id} to={`/?cat=${c.name}`} className="link">
                <li className="sidebarListItem">{c.name}</li>
              </Link>
            ))}
          </ul>
        </div>
      )}

      <Newsletter />

      <div className="sidebarItem">
        <span className="sidebarTitle">Follow Us</span>
        <div className="sidebarSocial">
          <i className="sidebarIcon fab fa-github"></i>
          <i className="sidebarIcon fab fa-twitter"></i>
          <i className="sidebarIcon fab fa-linkedin"></i>
          <i className="sidebarIcon fab fa-instagram"></i>
        </div>
      </div>
    </div>
  );
}
