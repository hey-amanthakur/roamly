import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import Posts from "../../components/posts/Posts";
import SideBar from "../../components/sidebar/SideBar";
import { PAGE_LIMITS, COLORS } from "../../constants";
import { Post, PaginatedPosts } from "../../types";

export default function Trending() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>("trending");

  useEffect(() => {
    const controller = new AbortController();
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get<PaginatedPosts>(
          `${API_URL}/posts?sort=${sortBy}&page=${page}&limit=${PAGE_LIMITS.DEFAULT}`,
          { signal: controller.signal }
        );
        setPosts(res.data.posts);
        setPages(res.data.pages);
      } catch (err: any) {
        if (err.name !== "CanceledError") {
          console.error("Failed to load trending posts");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    return () => controller.abort();
  }, [sortBy, page]);

  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  return (
    <div className="trending">
      <div className="trendingMain">
        <h2 className="trendingTitle">Trending Posts</h2>
        <div className="trendingSort">
          <button
            className={sortBy === "trending" ? "active" : ""}
            onClick={() => setSortBy("trending")}
          >
            Trending
          </button>
          <button
            className={sortBy === "popular" ? "active" : ""}
            onClick={() => setSortBy("popular")}
          >
            Popular
          </button>
          <button
            className={sortBy === "most_discussed" ? "active" : ""}
            onClick={() => setSortBy("most_discussed")}
          >
            Most Discussed
          </button>
        </div>
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: "center", color: COLORS.muted }}>No posts found</p>
        ) : (
          <>
            <Posts posts={posts} />
            {pages > 1 && (
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </button>
                <span>
                  Page {page} of {pages}
                </span>
                <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <SideBar />
    </div>
  );
}
