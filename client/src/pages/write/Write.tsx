import { useContext, useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Context } from "../../context/Context";
import { API_URL } from "../../config";
import LocationInput from "../../components/locationInput/LocationInput";
import { MAX_UPLOAD_FILES, COLORS } from "../../constants";
import { Location, Post } from "../../types";

interface NewPost {
  title: string;
  desc: string;
  status: string;
  tags: string[];
  categories: string[];
  location: Location;
  photo?: string;
  banner?: string;
  photos?: string[];
}

export default function Write() {
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [categories, setCategories] = useState<string>("");
  const [location, setLocation] = useState<Location>({} as Location);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { token } = useContext(Context);
  const history = useHistory();

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  useEffect(() => {
    if (bannerFile) {
      const url = URL.createObjectURL(bannerFile);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setBannerPreview("");
    }
  }, [bannerFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > MAX_UPLOAD_FILES) {
      setError("Maximum 5 images allowed");
      return;
    }
    setFiles(selected);
  };

  const uploadFiles = async (): Promise<string[]> => {
    const filenames: string[] = [];
    for (const file of files) {
      const data = new FormData();
      const filename = Date.now() + "-" + file.name;
      data.append("name", filename);
      data.append("file", file);
      try {
        await axios.post(`${API_URL}/upload`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        filenames.push(filename);
      } catch (err) {
        throw new Error("Failed to upload image: " + file.name);
      }
    }
    return filenames;
  };

  const uploadBanner = async (): Promise<string | undefined> => {
    if (!bannerFile) return undefined;
    const data = new FormData();
    const filename = Date.now() + "-banner-" + bannerFile.name;
    data.append("name", filename);
    data.append("file", bannerFile);
    await axios.post(`${API_URL}/upload`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return filename;
  };

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent, status: string = "published") => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const newPost: NewPost = {
      title,
      desc,
      status,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      categories: categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      location,
    };

    if (files.length > 0) {
      try {
        const filenames = await uploadFiles();
        if (filenames.length === 1) {
          newPost.photo = filenames[0];
        } else {
          newPost.photos = filenames;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to upload image";
        setError(message);
        setLoading(false);
        return;
      }
    }

    if (bannerFile) {
      try {
        const bannerFilename = await uploadBanner();
        if (bannerFilename) {
          newPost.banner = bannerFilename;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to upload banner";
        setError(message);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await axios.post<Post>(`${API_URL}/posts`, newPost, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (status === "draft") {
        history.push("/dashboard");
      } else {
        history.push("/post/" + res.data._id);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Failed to create post");
      setLoading(false);
    }
  };

  return (
    <div className="write">
      {files.length > 0 && (
        <div className="writePreview">
          {previewUrls.map((url, i) => (
            <img key={i} className="writePreviewImg" src={url} alt="" />
          ))}
        </div>
      )}
      {bannerPreview && (
        <div className="writeBannerPreview">
          <img className="writeBannerPreviewImg" src={bannerPreview} alt="Banner preview" />
          <button className="writeBannerRemove" type="button" onClick={() => setBannerFile(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      <form className="writeForm" onSubmit={handleSubmit}>
        <div className="writeFormGroup">
          <label htmlFor="fileInput">
            <i className="writeIcon fas fa-plus"></i>
          </label>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
          <input
            type="text"
            placeholder="Title"
            className="writeInput"
            autoFocus={true}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="writeFormGroup writeBannerField">
          <label htmlFor="bannerInput" className="writeBannerLabel">
            <i className="fas fa-image"></i> Banner Image
          </label>
          <input
            type="file"
            id="bannerInput"
            style={{ display: "none" }}
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                setBannerFile(files[0]);
              }
            }}
          />
          <span className="writeMetaHint">Optional cover image for your post</span>
        </div>

        <LocationInput location={location} onChange={setLocation} />

        <div className="writeFormGroup writeMeta">
          <div className="writeMetaField">
            <label>Tags</label>
            <input
              type="text"
              placeholder="e.g. beach, sunset, backpacking"
              className="writeMetaInput"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <span className="writeMetaHint">Comma-separated</span>
          </div>
          <div className="writeMetaField">
            <label>Categories</label>
            <input
              type="text"
              placeholder="e.g. Adventure, Budget"
              className="writeMetaInput"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
            />
            <span className="writeMetaHint">Comma-separated</span>
          </div>
        </div>

        <div className="writeFormGroup">
          <textarea
            placeholder="Tell your story..."
            className="writeInput writeText"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
        </div>

        {error && (
          <span style={{ color: COLORS.error, marginBottom: "10px", marginLeft: "150px" }}>{error}</span>
        )}

        <div className="writeActions">
          <button
            className="writeDraftBtn"
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, "draft")}
          >
            Save Draft
          </button>
          <button className="writeSubmit" type="submit" disabled={loading}>
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
