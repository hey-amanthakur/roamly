import axios from "axios";
import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { API_URL } from "../../config";

export default function Login() {
  const userRef = useRef();
  const passwordRef = useRef();
  const { dispatch, isFetching } = useContext(Context);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        username: userRef.current.value,
        password: passwordRef.current.value,
      });
      const { token, ...userData } = res.data;
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: userData, token },
      });
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE" });
      setError(err.response?.data?.message || "Invalid username or password");
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
          <h2>wanderlog</h2>
          <p>Share your travel stories with the world</p>
        </div>
      </div>
    </div>
  );
}
