import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Context } from "../../context/Context";
import { API_URL } from "../../config";
import Posts from "../../components/posts/Posts";
import SideBar from "../../components/sidebar/SideBar";
import { PAGE_LIMITS, COLORS } from "../../constants";
import { Post, PaginatedPosts } from "../../types";

export default function Bookmarks() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const { token } = useContext(Context);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const res = await axios.get<PaginatedPosts>(`${API_URL}/bookmarks?page=${page}&limit=${PAGE_LIMITS.DEFAULT}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data.posts);
        setPages(res.data.pages);
      } catch (err) {
        console.error("Failed to load bookmarks");
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [token, page]);

  return (
    <div className="bookmarks">
      <div className="bookmarksMain">
        <h2 className="bookmarksTitle">Your Bookmarks</h2>
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: "center", color: COLORS.muted }}>
            No bookmarks yet. Start saving posts you love!
          </p>
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
