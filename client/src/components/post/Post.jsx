import { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { API_URL, IMAGES_URL } from "../../config";
import axios from "axios";

const CAT_COLORS = {
  travel: "travel",
  food: "food",
  code: "code",
};

export default function Post({ post }) {
  const { token } = useContext(Context);

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
          {post.categories?.map((c, i) => {
            const catName = typeof c === "string" ? c : c.name;
            const catKey = catName.toLowerCase().replace(/\s+/g, "_");
            return (
              <Link key={i} to={`/?cat=${catName}`} className="link">
                <span className="postCat" data-cat={CAT_COLORS[catKey] || ""}>
                  {catName}
                </span>
              </Link>
            );
          })}
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
