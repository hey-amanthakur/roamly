import { useContext, useEffect, useState, useCallback, KeyboardEvent } from "react";
import axios from "axios";
import { useLocation, useHistory, Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { API_URL, IMAGES_URL } from "../../config";
import ShareButton from "../shareButton/ShareButton";
import ReportModal from "../reportModal/ReportModal";
import PhotoGallery from "../photoGallery/PhotoGallery";
import { COLORS, MAX_UPLOAD_FILES } from "../../constants";
import { Post, Comment, ContextValue } from "../../types";

export default function SinglePost() {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  const [post, setPost] = useState<Post>({} as Post);
  const { user, token } = useContext(Context) as ContextValue;
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [updateMode, setUpdateMode] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
  const history = useHistory();

  useEffect(() => {
    const controller = new AbortController();
    const getPost = async (): Promise<void> => {
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get<Post>(`${API_URL}/posts/${path}`, { headers, signal: controller.signal });
        setPost(res.data);
        setTitle(res.data.title);
        setDesc(res.data.desc);
      } catch (err: any) {
        if (err.name !== "CanceledError") {
          setError("Failed to load post");
        }
      } finally {
        setLoading(false);
      }
    };
    getPost();
    return () => controller.abort();
  }, [path, token]);

  useEffect(() => {
    if (post._id) {
      const controller = new AbortController();
      const fetchRelated = async (): Promise<void> => {
        try {
          const res = await axios.get<Post[]>(`${API_URL}/posts/${post._id}/related`, { signal: controller.signal });
          setRelatedPosts(res.data);
        } catch (err: any) {
          if (err.name !== "CanceledError") {
            // ignore
          }
        }
      };
      fetchRelated();
      return () => controller.abort();
    }
  }, [post._id]);

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setNewPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  const handleDelete = async (): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      history.push("/");
    } catch (err) {
      setError("Failed to delete post");
    }
  };

  const handleUpdate = async (): Promise<void> => {
    try {
      const updates: Record<string, any> = { title, desc };

      if (newFiles.length > 0) {
        const filenames: string[] = [];
        for (const file of newFiles) {
          const data = new FormData();
          const filename = Date.now() + "-" + file.name;
          data.append("name", filename);
          data.append("file", file);
          await axios.post(`${API_URL}/upload`, data, {
            headers: { Authorization: `Bearer ${token}` },
          });
          filenames.push(filename);
        }
        if (filenames.length === 1) {
          updates.photo = filenames[0];
        } else {
          updates.photos = filenames;
        }
      }

      const res = await axios.put<Post>(
        `${API_URL}/posts/${post._id}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(res.data);
      setUpdateMode(false);
      setNewFiles([]);
    } catch (err) {
      setError("Failed to update post");
    }
  };

  const handleLike = async (): Promise<void> => {
    if (!token) {
      history.push("/login");
      return;
    }
    try {
      const res = await axios.put<{ liked: boolean }>(
        `${API_URL}/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost((prev) => ({
        ...prev,
        isLiked: res.data.liked,
        likes: res.data.liked
          ? [...(prev.likes || []), user!._id]
          : (prev.likes || []).filter((id: string) => id !== user!._id),
      }));
    } catch (err) {
      setError("Failed to toggle like");
      setTimeout(() => setError(""), 2000);
    }
  };

  const handleBookmark = async (): Promise<void> => {
    if (!token) {
      history.push("/login");
      return;
    }
    try {
      const res = await axios.put<{ bookmarked: boolean }>(
        `${API_URL}/bookmarks/posts/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost((prev) => ({
        ...prev,
        isBookmarked: res.data.bookmarked,
        bookmarks: res.data.bookmarked
          ? [...(prev.bookmarks || []), user!._id]
          : (prev.bookmarks || []).filter((id: string) => id !== user!._id),
      }));
    } catch (err) {
      setError("Failed to toggle bookmark");
      setTimeout(() => setError(""), 2000);
    }
  };

  const handleComment = async (): Promise<void> => {
    if (!commentText.trim()) return;
    try {
      const res = await axios.post<Comment>(
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

  const handleDeleteComment = async (commentId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/posts/${post._id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost((prev) => ({
        ...prev,
        comments: (prev.comments || []).filter((c: Comment) => c._id !== commentId),
      }));
    } catch (err) {
      setError("Failed to delete comment");
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "20px" }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center", color: COLORS.error, marginTop: "20px" }}>{error}</p>;

  const allPhotos: string[] = [];
  if (post.photo) allPhotos.push(`${IMAGES_URL}/${post.photo}`);
  if (post.photos?.length) {
    post.photos.forEach((p: string) => allPhotos.push(`${IMAGES_URL}/${p}`));
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
          {post.tags?.map((tag: string, i: number) => (
            <Link key={i} to={`/?tag=${tag}`} className="tagBadge">
              #{tag}
            </Link>
          ))}
          {post.categories?.map((cat: string, i: number) => (
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
              style={{ cursor: "pointer", color: post.isLiked ? COLORS.error : COLORS.gray, fontSize: "20px" }}
            ></i>
            <span>{post.likes?.length || 0} likes</span>
          </div>

          <div className="singlePostActionsRight">
            <i
              className={`fas fa-bookmark ${post.isBookmarked ? "bookmarked" : ""}`}
              onClick={handleBookmark}
              style={{ cursor: "pointer", fontSize: "18px", color: post.isBookmarked ? COLORS.teal : COLORS.gray, marginRight: "15px" }}
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

        {updateMode && (
          <div className="editMediaSection">
            <div className="editPhotosSection">
              <label>Photos</label>
              {newPreviewUrls.length > 0 && (
                <div className="editPhotosPreview">
                  {newPreviewUrls.map((url, i) => (
                    <img key={i} src={url} alt="" />
                  ))}
                </div>
              )}
              {newFiles.length === 0 && allPhotos.length > 0 && (
                <div className="editPhotosPreview">
                  {allPhotos.map((url, i) => (
                    <img key={i} src={url} alt="" />
                  ))}
                </div>
              )}
              <label htmlFor="editPhotosInput" className="editMediaBtn">
                <i className="fas fa-plus"></i> {allPhotos.length > 0 ? "Replace Photos" : "Add Photos"}
              </label>
              <input
                type="file"
                id="editPhotosInput"
                style={{ display: "none" }}
                accept="image/*"
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  if (selected.length > MAX_UPLOAD_FILES) {
                    setError("Maximum 5 images allowed");
                    return;
                  }
                  setNewFiles(selected);
                }}
              />
            </div>
          </div>
        )}

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
          <div className="editActions">
            <button className="singlePostButton" onClick={handleUpdate}>
              Update
            </button>
            <button className="singlePostCancelBtn" onClick={() => {
              setUpdateMode(false);
              setNewFiles([]);
              setTitle(post.title);
              setDesc(post.desc);
            }}>
              Cancel
            </button>
          </div>
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
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleComment()}
              />
              <button onClick={handleComment}>Post</button>
            </div>
          )}
          {post.comments?.map((c: Comment) => (
            <div key={c._id} className="comment">
              <Link to={`/profile/${c.username}`} className="link">
                <b>{c.username}</b>
              </Link>
              <span>: {c.text}</span>
              {(c.username === user?.username || c.userId === user?._id) && (
                <i
                  className="fas fa-times"
                  onClick={() => handleDeleteComment(c._id)}
                   style={{ cursor: "pointer", marginLeft: "8px", color: COLORS.gray }}
                ></i>
              )}
            </div>
          ))}
        </div>

        {relatedPosts.length > 0 && (
          <div className="relatedPosts">
            <h3>You might also like</h3>
            <div className="relatedPostsGrid">
              {relatedPosts.map((rp: Post) => (
                <Link key={rp._id} to={`/post/${rp._id}`} className="relatedPostCard">
                  {rp.photo && (
                    <img src={`${IMAGES_URL}/${rp.photo}`} alt={rp.title} />
                  )}
                  <div>
                    <span className="relatedPostTitle">{rp.title}</span>
                    <span className="relatedPostMeta">
                      {rp.likes?.length || 0} likes · {rp.views || 0} views
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
