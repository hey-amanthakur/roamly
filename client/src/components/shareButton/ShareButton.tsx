import { useState } from "react";

interface ShareButtonProps {
  postId: string;
  title: string;
}

export default function ShareButton({ postId, title }: ShareButtonProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const shareUrl: string = `${window.location.origin}/post/${postId}`;

  const handleShare = async (): Promise<void> => {
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
