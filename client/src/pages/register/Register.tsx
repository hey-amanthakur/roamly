import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../config";
import { PASSWORD_MIN_LENGTH } from "../../constants";

export default function Register() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });
      window.location.replace("/login");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authHeader">
          <div className="authLogo">
            <div className="authLogoBox">
              <i className="fas fa-user-plus"></i>
            </div>
          </div>
          <h1 className="authTitle">Create account</h1>
          <p className="authSubtitle">Join the community of travelers</p>
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          <div className="authField">
            <label htmlFor="username">Username</label>
            <div className="authInputWrapper">
              <i className="fas fa-user"></i>
              <input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="authField">
            <label htmlFor="email">Email</label>
            <div className="authInputWrapper">
              <i className="fas fa-envelope"></i>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="authField">
            <label htmlFor="password">Password</label>
            <div className="authInputWrapper">
              <i className="fas fa-lock"></i>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                minLength={PASSWORD_MIN_LENGTH}
              />
            </div>
          </div>

          {error && (
            <div className="authError">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <button
            className="authButton authButtonPrimary"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="authSpinner"></span>
            ) : (
              <>
                Create Account
                <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="authFooter">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="authLink">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="authVisual">
        <div className="authVisualContent">
          <div className="authVisualDot"></div>
          <h2>roamly</h2>
          <p>Share your travel stories with the world</p>
        </div>
      </div>
    </div>
  );
}
