import { useContext, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Context } from "../../context/Context";
import { API_URL, IMAGES_URL } from "../../config";
import axios from "axios";
import { Post as PostType, ContextValue } from "../../types";

interface PostProps {
  post: PostType;
}

const CAT_COLORS: Record<string, string> = {
  travel: "travel",
  food: "food",
  code: "code",
};

export default function Post({ post }: PostProps) {
  const { token } = useContext(Context) as ContextValue;
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [bookmarkError, setBookmarkError] = useState<boolean>(false);
  const history = useHistory();

  const handleBookmark = async (e: React.MouseEvent<HTMLElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
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
      setBookmarked(res.data.bookmarked);
    } catch (err) {
      setBookmarkError(true);
      setTimeout(() => setBookmarkError(false), 2000);
    }
  };

  return (
    <Link to={`/post/${post._id}`} className="link">
      <div className="post">
        {post.photo && (
          <img className="postImg" src={`${IMAGES_URL}/${post.photo}`} alt={post.title} />
        )}
        <div className="postInfo">
          <div className="postCats">
            {post.categories?.map((c: string, i: number) => {
              const catName = typeof c === "string" ? c : typeof c === "object" && c !== null && "name" in c ? (c as { name: string }).name : String(c);
              const catKey = catName.toLowerCase().replace(/\s+/g, "_");
              return (
                <span key={i} className="postCat" data-cat={CAT_COLORS[catKey] || ""}>
                  {catName}
                </span>
              );
            })}
            {post.tags?.slice(0, 3).map((tag: string, i: number) => (
              <span key={`tag-${i}`} className="postTag">#{tag}</span>
            ))}
          </div>
          <span className="postTitle">{post.title}</span>
          <div className="postMeta">
            <span className="postAuthor">{post.username}</span>
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
              className={`fas fa-bookmark postBookmark ${bookmarked ? "active" : ""} ${bookmarkError ? "error" : ""}`}
              onClick={handleBookmark}
              title={bookmarkError ? "Failed to update bookmark" : ""}
            ></i>
          )}
        </div>
      </div>
    </Link>
  );
}
