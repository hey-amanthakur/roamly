import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Context } from "../../context/Context";
import { API_URL, IMAGES_URL } from "../../config";
import Posts from "../../components/posts/Posts";
import SideBar from "../../components/sidebar/SideBar";
import "./profile.css";

export default function Profile() {
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user, token, dispatch } = useContext(Context);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const postsRes = await axios.get(
          `${API_URL}/posts?user=${username}&page=${page}&limit=5`
        );
        setPosts(postsRes.data.posts);
        setPages(postsRes.data.pages);

        if (postsRes.data.posts.length > 0) {
          const userRes = await axios.get(
            `${API_URL}/users/${postsRes.data.posts[0].userId}`
          );
          setProfileUser(userRes.data);
          if (user) {
            setIsFollowing(
              userRes.data.followers?.includes(user._id) || false
            );
          }
        }
      } catch (err) {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, page, user]);

  const handleFollow = async () => {
    if (!token) {
      window.location.replace("/login");
      return;
    }
    try {
      if (isFollowing) {
        await axios.put(
          `${API_URL}/users/${profileUser._id}/unfollow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(false);
        setProfileUser((prev) => ({
          ...prev,
          followers: prev.followers.filter((id) => id !== user._id),
        }));
      } else {
        await axios.put(
          `${API_URL}/users/${profileUser._id}/follow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(true);
        setProfileUser((prev) => ({
          ...prev,
          followers: [...(prev.followers || []), user._id],
        }));
      }
    } catch (err) {
      console.error("Follow action failed");
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "20px" }}>Loading...</p>;
  if (!profileUser) return <p style={{ textAlign: "center", marginTop: "20px" }}>User not found</p>;

  const isOwnProfile = user?.username === username;

  return (
    <div className="profile">
      <div className="profileMain">
        <div className="profileHeader">
          <img
            className="profilePic"
            src={
              profileUser.profilePic
                ? `${IMAGES_URL}/${profileUser.profilePic}`
                : `${IMAGES_URL}/default-avatar.png`
            }
            alt={profileUser.username}
          />
          <div className="profileInfo">
            <h2 className="profileUsername">{profileUser.username}</h2>
            {profileUser.bio && (
              <p className="profileBio">{profileUser.bio}</p>
            )}
            <div className="profileStats">
              <span>{posts.length} posts</span>
              <span>{profileUser.followers?.length || 0} followers</span>
              <span>{profileUser.followings?.length || 0} following</span>
            </div>
            {!isOwnProfile && token && (
              <button
                className={`followBtn ${isFollowing ? "unfollow" : ""}`}
                onClick={handleFollow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

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
      </div>
      <SideBar />
    </div>
  );
}
