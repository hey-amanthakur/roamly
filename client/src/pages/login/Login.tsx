import axios from "axios";
import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { API_URL } from "../../config";
import { User } from "../../types";

export default function Login() {
  const userRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { dispatch, isFetching } = useContext(Context);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    dispatch({ type: "LOGIN_START" });
    try {
      const username = userRef.current?.value || "";
      const password = passwordRef.current?.value || "";
      if (!username || !password) {
        setError("Username and password are required");
        return;
      }
      const res = await axios.post<{ token: string } & User>(`${API_URL}/auth/login`, {
        username,
        password,
      });
      const { token, ...userData } = res.data;
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: userData, token },
      });
    } catch (err: unknown) {
      dispatch({ type: "LOGIN_FAILURE" });
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Invalid username or password");
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authHeader">
          <div className="authLogo">
            <div className="authLogoBox">
              <i className="fas fa-compass"></i>
            </div>
          </div>
          <h1 className="authTitle">Welcome back</h1>
          <p className="authSubtitle">Sign in to continue your journey</p>
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          <div className="authField">
            <label htmlFor="username">Username</label>
            <div className="authInputWrapper">
              <i className="fas fa-user"></i>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                ref={userRef}
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
                placeholder="Enter your password"
                ref={passwordRef}
                required
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
            disabled={isFetching}
          >
            {isFetching ? (
              <span className="authSpinner"></span>
            ) : (
              <>
                Sign In
                <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="authFooter">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="authLink">
              Create one
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
