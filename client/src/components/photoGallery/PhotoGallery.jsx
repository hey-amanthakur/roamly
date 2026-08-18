import { useState } from "react";

export default function PhotoGallery({ photos }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  if (!photos || photos.length === 0) return null;

  const close = () => setSelectedIndex(null);
  const prev = (e) => {
    e.stopPropagation();
    setSelectedIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  };
  const next = (e) => {
    e.stopPropagation();
    setSelectedIndex((i) => (i < photos.length - 1 ? i + 1 : 0));
  };

  return (
    <div className="photoGallery">
      <div className="galleryGrid">
        {photos.map((photo, i) => (
          <img
            key={i}
            src={photo}
            alt={`Gallery ${i + 1}`}
            className="galleryThumb"
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="lightbox" onClick={close}>
          <button className="lightboxClose" onClick={close}>
            &times;
          </button>
          {photos.length > 1 && (
            <>
              <button className="lightboxPrev" onClick={prev}>
                &#8249;
              </button>
              <button className="lightboxNext" onClick={next}>
                &#8250;
              </button>
            </>
          )}
          <img
            src={photos[selectedIndex]}
            alt={`Gallery ${selectedIndex + 1}`}
            className="lightboxImg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="lightboxCounter">
            {selectedIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
