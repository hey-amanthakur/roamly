import { useState } from "react";
import "./shareButton.css";

export default function ShareButton({ postId, title }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/post/${postId}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="shareButton">
      <button onClick={handleShare} title="Share this post">
        <i className="fas fa-share-alt"></i>
      </button>
      {copied && <span className="copiedTooltip">Link copied!</span>}
    </div>
  );
}
