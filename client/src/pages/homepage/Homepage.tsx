import { useContext, useEffect, useState } from "react";
import Header from "../../components/header/Header";
import Posts from "../../components/posts/Posts";
import Sidebar from "../../components/sidebar/SideBar";
import axios from "axios";
import { useLocation, useHistory } from "react-router-dom";
import { API_URL } from "../../config";
import { Context } from "../../context/Context";
import { CATEGORIES, PAGE_LIMITS, COLORS } from "../../constants";
import { Post, PaginatedPosts } from "../../types";

export default function Homepage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const { search } = useLocation();
  const history = useHistory();
  const { token } = useContext(Context);

  const searchParams = new URLSearchParams(search);
  const searchQuery = searchParams.get("search") || "";
  const tagQuery = searchParams.get("tag") || "";
  const catQuery = searchParams.get("cat") || "";

  useEffect(() => {
    if (catQuery && CATEGORIES.find((c) => c.key === catQuery)) {
      setActiveCategory(catQuery);
    }
  }, [catQuery]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, activeCategory]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        let url: string;
        if (searchQuery) {
          url = `${API_URL}/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${PAGE_LIMITS.DEFAULT}`;
        } else {
          let params = `page=${page}&limit=${PAGE_LIMITS.DEFAULT}`;
          if (tagQuery) params += `&tag=${tagQuery}`;
          if (activeCategory) params += `&cat=${activeCategory}`;
          if (sortBy) params += `&sort=${sortBy}`;
          url = `${API_URL}/posts?${params}`;
        }
        const res = await axios.get<PaginatedPosts>(url, { signal: controller.signal });
        setPosts(res.data.posts);
        setPages(res.data.pages);
        setTotal(res.data.total);
      } catch (err: any) {
        if (err.name !== "CanceledError") {
          setError("Failed to load posts");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    return () => controller.abort();
  }, [search, page, sortBy, searchQuery, tagQuery, activeCategory]);

  const handleCategoryClick = (catKey: string) => {
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
              <h2>Search results for &quot;{searchQuery}&quot;</h2>
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
            <p style={{ textAlign: "center", color: COLORS.muted, marginTop: "40px" }}>
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
