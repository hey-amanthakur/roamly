import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { API_URL, IMAGES_URL } from "../../config";
import ShareButton from "../shareButton/ShareButton";
import ReportModal from "../reportModal/ReportModal";
import PhotoGallery from "../photoGallery/PhotoGallery";
import "./singlePost.css";

export default function SinglePost() {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  const [post, setPost] = useState({});
  const { user, token } = useContext(Context);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [updateMode, setUpdateMode] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const getPost = async () => {
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_URL}/posts/${path}`, { headers });
        setPost(res.data);
        setTitle(res.data.title);
        setDesc(res.data.desc);
      } catch (err) {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    getPost();
  }, [path, token]);

  useEffect(() => {
    if (post._id) {
      const fetchRelated = async () => {
        try {
          const res = await axios.get(`${API_URL}/posts/${post._id}/related`);
          setRelatedPosts(res.data);
        } catch (err) {
          // ignore
        }
      };
      fetchRelated();
    }
  }, [post._id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.replace("/");
    } catch (err) {
      setError("Failed to delete post");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `${API_URL}/posts/${post._id}`,
        { title, desc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(res.data);
      setUpdateMode(false);
    } catch (err) {
      setError("Failed to update post");
    }
  };

  const handleLike = async () => {
    if (!token) {
      window.location.replace("/login");
      return;
    }
    try {
      const res = await axios.put(
        `${API_URL}/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost((prev) => ({
        ...prev,
        isLiked: res.data.liked,
        likes: res.data.liked
          ? [...(prev.likes || []), user._id]
          : (prev.likes || []).filter((id) => id !== user._id),
      }));
    } catch (err) {
      console.error("Failed to toggle like");
    }
  };

  const handleBookmark = async () => {
    if (!token) {
      window.location.replace("/login");
      return;
    }
    try {
      const res = await axios.put(
        `${API_URL}/bookmarks/posts/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost((prev) => ({
        ...prev,
        isBookmarked: res.data.bookmarked,
        bookmarks: res.data.bookmarked
          ? [...(prev.bookmarks || []), user._id]
          : (prev.bookmarks || []).filter((id) => id !== user._id),
      }));
    } catch (err) {
      console.error("Failed to toggle bookmark");
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(
        `${API_URL}/posts/${post._id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), res.data],
      }));
      setCommentText("");
    } catch (err) {
      setError("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API_URL}/posts/${post._id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost((prev) => ({
        ...prev,
        comments: (prev.comments || []).filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      setError("Failed to delete comment");
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "20px" }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red", marginTop: "20px" }}>{error}</p>;

  const allPhotos = [];
  if (post.photo) allPhotos.push(`${IMAGES_URL}/${post.photo}`);
  if (post.photos?.length) {
    post.photos.forEach((p) => allPhotos.push(`${IMAGES_URL}/${p}`));
  }

  return (
    <div className="singlePost">
      <div className="singlePostWrapper">
        {allPhotos.length > 0 && (
          <>
            {allPhotos.length === 1 ? (
              <img src={allPhotos[0]} alt="" className="singlePostImg" />
            ) : (
              <PhotoGallery photos={allPhotos} />
            )}
          </>
        )}

        {updateMode ? (
          <input
            type="text"
            value={title}
            className="singlePostTitleInput"
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <h1 className="singlePostTitle">
            {title}
            {post.username === user?.username && (
              <div className="singlePostEdit">
                <i
                  className="singlePostIcon far fa-edit"
                  onClick={() => setUpdateMode(true)}
                ></i>
                <i
                  className="singlePostIcon far fa-trash-alt"
                  onClick={handleDelete}
                ></i>
              </div>
            )}
          </h1>
        )}

        <div className="singlePostInfo">
          <span className="singlePostAuthor">
            Author:
            <Link to={`/profile/${post.username}`} className="link">
              <b> {post.username}</b>
            </Link>
          </span>
          <span className="singlePostDate">
            {new Date(post.createdAt).toDateString()}
          </span>
        </div>

        {post.location?.name && (
          <div className="singlePostLocation">
            <i className="fas fa-map-marker-alt"></i>
            <span>{post.location.name}</span>
          </div>
        )}

        <div className="singlePostTags">
          {post.tags?.map((tag, i) => (
            <Link key={i} to={`/?tag=${tag}`} className="tagBadge">
              #{tag}
            </Link>
          ))}
          {post.categories?.map((cat, i) => (
            <Link key={`cat-${i}`} to={`/?cat=${cat}`} className="catBadge">
              {cat}
            </Link>
          ))}
        </div>

        <div className="singlePostActions">
          <div className="singlePostLikes">
            <i
              className={`fas fa-heart ${post.isLiked ? "liked" : ""}`}
              onClick={handleLike}
              style={{ cursor: "pointer", color: post.isLiked ? "red" : "gray", fontSize: "20px" }}
            ></i>
            <span>{post.likes?.length || 0} likes</span>
          </div>

          <div className="singlePostActionsRight">
            <i
              className={`fas fa-bookmark ${post.isBookmarked ? "bookmarked" : ""}`}
              onClick={handleBookmark}
              style={{ cursor: "pointer", fontSize: "18px", color: post.isBookmarked ? "teal" : "gray", marginRight: "15px" }}
            ></i>
            <ShareButton postId={post._id} title={post.title} />
            {user && user.username !== post.username && (
              <button className="reportBtn" onClick={() => setShowReport(true)}>
                <i className="fas fa-flag"></i>
              </button>
            )}
          </div>
        </div>

        <div className="singlePostViews">
          <i className="fas fa-eye"></i>
          <span>{post.views || 0} views</span>
        </div>

        {updateMode ? (
          <textarea
            className="singlePostDescInput"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        ) : (
          <p className="singlePostDesc">{desc}</p>
        )}
        {updateMode && (
          <button className="singlePostButton" onClick={handleUpdate}>
            Update
          </button>
        )}

        <div className="singlePostComments">
          <h3>Comments ({post.comments?.length || 0})</h3>
          {token && (
            <div className="commentForm">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
              />
              <button onClick={handleComment}>Post</button>
            </div>
          )}
          {post.comments?.map((c) => (
            <div key={c._id} className="comment">
              <Link to={`/profile/${c.username}`} className="link">
                <b>{c.username}</b>
              </Link>
              <span>: {c.text}</span>
              {(c.username === user?.username || c.userId === user?._id) && (
                <i
                  className="fas fa-times"
                  onClick={() => handleDeleteComment(c._id)}
                  style={{ cursor: "pointer", marginLeft: "8px", color: "gray" }}
                ></i>
              )}
            </div>
          ))}
        </div>

        {relatedPosts.length > 0 && (
          <div className="relatedPosts">
            <h3>You might also like</h3>
            <div className="relatedPostsGrid">
              {relatedPosts.map((rp) => (
                <Link key={rp._id} to={`/post/${rp._id}`} className="relatedPostCard">
                  {rp.photo && (
                    <img src={`${IMAGES_URL}/${rp.photo}`} alt={rp.title} />
                  )}
                  <div>
                    <span className="relatedPostTitle">{rp.title}</span>
                    <span className="relatedPostMeta">
                      {rp.likes.length} likes · {rp.views} views
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal
          targetType="post"
          targetId={post._id}
          token={token}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
