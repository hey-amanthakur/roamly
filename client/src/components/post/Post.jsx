import { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { API_URL, IMAGES_URL } from "../../config";
import axios from "axios";
import "./post.css";

export default function Post({ post }) {
  const { user, token } = useContext(Context);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      window.location.replace("/login");
      return;
    }
    try {
      await axios.put(
        `${API_URL}/bookmarks/posts/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to toggle bookmark");
    }
  };

  return (
    <div className="post">
      {post.photo && (
        <img className="postImg" src={`${IMAGES_URL}/${post.photo}`} alt={post.title} />
      )}
      <div className="postInfo">
        <div className="postCats">
          {post.categories?.map((c, i) => (
            <Link key={i} to={`/?cat=${typeof c === "string" ? c : c.name}`} className="link">
              <span className="postCat">{typeof c === "string" ? c : c.name}</span>
            </Link>
          ))}
          {post.tags?.slice(0, 3).map((tag, i) => (
            <Link key={`tag-${i}`} to={`/?tag=${tag}`} className="link">
              <span className="postTag">#{tag}</span>
            </Link>
          ))}
        </div>
        <Link to={`/post/${post._id}`} className="link">
          <span className="postTitle">{post.title}</span>
        </Link>
        <div className="postMeta">
          <Link to={`/profile/${post.username}`} className="link">
            <span className="postAuthor">{post.username}</span>
          </Link>
          <span className="postDate">
            {new Date(post.createdAt).toDateString()}
          </span>
        </div>
        <hr />
      </div>
      <p className="postDesc">{post.desc}</p>
      <div className="postFooter">
        <div className="postStats">
          <span><i className="fas fa-heart"></i> {post.likes?.length || 0}</span>
          <span><i className="fas fa-comment"></i> {post.comments?.length || 0}</span>
          <span><i className="fas fa-eye"></i> {post.views || 0}</span>
        </div>
        {token && (
          <i
            className={`fas fa-bookmark postBookmark`}
            onClick={handleBookmark}
          ></i>
        )}
      </div>
    </div>
  );
}
