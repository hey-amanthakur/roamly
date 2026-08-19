import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { API_URL } from "../../config";
import { PAGE_LIMITS, COLORS } from "../../constants";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const { token } = useContext(Context);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/analytics/dashboard?page=${page}&limit=${PAGE_LIMITS.DASHBOARD}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data.stats);
        setPosts(res.data.posts);
        setPages(res.data.pages);
      } catch (err) {
        console.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token, page]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "20px" }}>Loading...</p>;

  return (
    <div className="dashboard">
      <h2 className="dashboardTitle">Author Dashboard</h2>

      {stats && (
        <div className="dashboardStats">
          <div className="statCard">
            <span className="statNumber">{stats.totalPosts}</span>
            <span className="statLabel">Posts</span>
          </div>
          <div className="statCard">
            <span className="statNumber">{stats.totalViews}</span>
            <span className="statLabel">Views</span>
          </div>
          <div className="statCard">
            <span className="statNumber">{stats.totalLikes}</span>
            <span className="statLabel">Likes</span>
          </div>
          <div className="statCard">
            <span className="statNumber">{stats.totalComments}</span>
            <span className="statLabel">Comments</span>
          </div>
        </div>
      )}

      <div className="dashboardPosts">
        <h3>Your Posts</h3>
        {posts.length === 0 ? (
          <p style={{ color: COLORS.muted }}>
            No posts yet. <Link to="/write">Write your first post!</Link>
          </p>
        ) : (
          <table className="dashboardTable">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.postId}>
                  <td>
                    <Link to={`/post/${p.postId}`} className="link">
                      {p.title}
                    </Link>
                  </td>
                  <td>
                    <span className={`statusBadge ${p.status}`}>{p.status}</span>
                  </td>
                  <td>{p.views}</td>
                  <td>{p.likes}</td>
                  <td>{p.comments}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
      </div>
    </div>
  );
}
