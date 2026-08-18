import { useContext, useEffect, useState } from "react";
import Header from "../../components/header/Header";
import Posts from "../../components/posts/Posts";
import Sidebar from "../../components/sidebar/SideBar";
import axios from "axios";
import { useLocation, useHistory } from "react-router";
import { API_URL } from "../../config";
import { Context } from "../../context/Context";

const CATEGORIES = [
  { key: "travel", label: "Travel", icon: "🌍" },
  { key: "food", label: "Food", icon: "🍜" },
  { key: "code", label: "Code", icon: "💻" },
];

export default function Homepage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const { search } = useLocation();
  const history = useHistory();
  const { token } = useContext(Context);

  const searchParams = new URLSearchParams(search);
  const searchQuery = searchParams.get("search") || "";
  const tagQuery = searchParams.get("tag") || "";
  const catQuery = searchParams.get("cat") || "";

  useEffect(() => {
    if (catQuery && CATEGORIES.find(c => c.key === catQuery)) {
      setActiveCategory(catQuery);
    }
  }, [catQuery]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        let url;
        if (searchQuery) {
          url = `${API_URL}/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=10`;
        } else {
          let params = `page=${page}&limit=10`;
          if (tagQuery) params += `&tag=${tagQuery}`;
          if (activeCategory) params += `&cat=${activeCategory}`;
          if (sortBy) params += `&sort=${sortBy}`;
          url = `${API_URL}/posts?${params}`;
        }
        const res = await axios.get(url);
        setPosts(res.data.posts);
        setPages(res.data.pages);
        setTotal(res.data.total);
      } catch (err) {
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [search, page, sortBy, searchQuery, tagQuery, activeCategory]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, activeCategory]);

  const handleCategoryClick = (catKey) => {
    if (activeCategory === catKey) {
      setActiveCategory("");
      history.push("/");
    } else {
      setActiveCategory(catKey);
      history.push(`/?cat=${catKey}`);
    }
  };

  return (
    <>
      <Header />
      <div className="home">
        <div className="homeMain">
          {searchQuery && (
            <div className="searchResults">
              <h2>Search results for "{searchQuery}"</h2>
              <span>{total} posts found</span>
            </div>
          )}
          {tagQuery && (
            <div className="searchResults">
              <h2>Posts tagged #{tagQuery}</h2>
              <span>{total} posts found</span>
            </div>
          )}

          {!searchQuery && !tagQuery && (
            <>
              <div className="categoryChips" style={{ padding: "0 20px" }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    className={`categoryChip ${activeCategory === cat.key ? "active" : ""}`}
                    data-cat={cat.key}
                    onClick={() => handleCategoryClick(cat.key)}
                  >
                    <span className="chipIcon">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="homeSort">
                <button
                  className={sortBy === "" ? "active" : ""}
                  onClick={() => setSortBy("")}
                >
                  Latest
                </button>
                <button
                  className={sortBy === "popular" ? "active" : ""}
                  onClick={() => setSortBy("popular")}
                >
                  Popular
                </button>
                <button
                  className={sortBy === "trending" ? "active" : ""}
                  onClick={() => setSortBy("trending")}
                >
                  Trending
                </button>
                <button
                  className={sortBy === "most_discussed" ? "active" : ""}
                  onClick={() => setSortBy("most_discussed")}
                >
                  Most Discussed
                </button>
              </div>
            </>
          )}

          {loading ? (
            <p style={{ textAlign: "center" }}>Loading...</p>
          ) : error ? (
            <p style={{ textAlign: "center", color: "red" }}>{error}</p>
          ) : posts.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999", marginTop: "40px" }}>
              No posts found. {token ? "Be the first to write!" : "Login to start writing."}
            </p>
          ) : (
            <>
              <Posts posts={posts} />
              {pages > 1 && (
                <div className="pagination">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Prev
                  </button>
                  <span>
                    Page {page} of {pages}
                  </span>
                  <button
                    disabled={page >= pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <Sidebar />
      </div>
    </>
  );
}
