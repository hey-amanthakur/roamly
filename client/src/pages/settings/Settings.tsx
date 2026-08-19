import SideBar from "../../components/sidebar/SideBar";
import { useContext, useState } from "react";
import { Context } from "../../context/Context";
import axios from "axios";
import { API_URL, IMAGES_URL } from "../../config";
import { DEFAULT_AVATAR, BIO_MAX_LENGTH, COLORS } from "../../constants";
import { User } from "../../types";

interface UpdatedUser {
  userId: string;
  username?: string;
  email?: string;
  password?: string;
  bio?: string;
  profilePic?: string;
}

export default function Settings() {
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { user, token, dispatch, theme } = useContext(Context);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    dispatch({ type: "UPDATE_START" });

    const updatedUser: UpdatedUser = { userId: user!._id };
    if (username.trim()) updatedUser.username = username.trim();
    if (email.trim()) updatedUser.email = email.trim();
    if (password) updatedUser.password = password;
    if (bio !== undefined) updatedUser.bio = bio;

    if (file) {
      const data = new FormData();
      const filename = Date.now() + "-" + file.name;
      data.append("name", filename);
      data.append("file", file);
      updatedUser.profilePic = filename;
      try {
        await axios.post(`${API_URL}/upload`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        setError("Failed to upload image");
        dispatch({ type: "UPDATE_FAILURE" });
        return;
      }
    }

    try {
      const res = await axios.put<User>(`${API_URL}/users/${user!._id}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(true);
      dispatch({ type: "UPDATE_SUCCESS", payload: res.data });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Update failed");
      dispatch({ type: "UPDATE_FAILURE" });
    }
  };

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  return (
    <div className="settings">
      <div className="settingsWrapper">
        <div className="settingsTitle">
          <span className="settingsUpdateTitle">Update Your Account</span>
        </div>
        <form className="settingsForm" onSubmit={handleSubmit}>
          <label>Profile Picture</label>
          <div className="settingsPP">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : user!.profilePic
                  ? `${IMAGES_URL}/${user!.profilePic}`
                  : `${IMAGES_URL}/${DEFAULT_AVATAR}`
              }
              alt=""
            />
            <label htmlFor="fileInput">
              <i className="settingsPPIcon far fa-user-circle"></i>
            </label>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setFile(files[0]);
                }
              }}
            />
          </div>
          <label>Username</label>
          <input
            type="text"
            placeholder={user!.username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          />
          <label>Email</label>
          <input
            type="email"
            placeholder={user!.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
          <label>Bio</label>
          <input
            type="text"
            placeholder={user!.bio || "Tell us about yourself..."}
            maxLength={BIO_MAX_LENGTH}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBio(e.target.value)}
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="Leave blank to keep current"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <div className="settingsTheme">
            <label>Theme</label>
            <button
              type="button"
              className={`themeBtn ${theme}`}
              onClick={toggleTheme}
            >
              <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
              {theme === "dark" ? " Light Mode" : " Dark Mode"}
            </button>
          </div>
          <button className="settingsSubmit" type="submit">
            Update
          </button>
          {success && (
            <span
              style={{
                color: COLORS.green,
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              Profile has been updated...
            </span>
          )}
          {error && (
            <span
              style={{
                color: COLORS.error,
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              {error}
            </span>
          )}
        </form>
      </div>
      <SideBar />
    </div>
  );
}
