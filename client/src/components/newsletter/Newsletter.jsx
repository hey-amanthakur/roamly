import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import "./newsletter.css";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${API_URL}/newsletter`, { email });
      setMessage(res.data.message);
      setEmail("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newsletter">
      <span className="newsletterTitle">NEWSLETTER</span>
      <p className="newsletterDesc">
        Subscribe to get the latest travel stories delivered to your inbox.
      </p>
      <form className="newsletterForm" onSubmit={handleSubscribe}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Subscribe"}
        </button>
      </form>
      {message && <p className="newsletterMsg">{message}</p>}
    </div>
  );
}
