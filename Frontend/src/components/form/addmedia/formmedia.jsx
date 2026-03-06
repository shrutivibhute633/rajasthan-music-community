import React, { useState, useEffect } from "react";
import { Plus, X, Maximize } from "lucide-react";
import "./formmedia.css";
import imageCompression from "browser-image-compression";

const handleImageChange = async (
  e,
  setFormData,
  setSizeMB,
  setAllowedImages,
  allowedImages,
  setCompressingMessage,
  setCompressionProgress
) => {
  const files = Array.from(e.target.files);

  const options = {
    useWebWorker: true,
    fileType: "image/webp",
    onProgress: (progress) => {
      setCompressionProgress(progress); // progress is 0-100
    },
  };

  const finalFiles = [];
  let sizeMB_curr = 0;

  for (const file of files) {
    if (allowedImages <= 0) {
      alert("You have reached the maximum number of images allowed.");
      break;
    }
    try {
      setCompressingMessage(
        `Compressing Img ....`
      );
      const compressedFile = await imageCompression(file, options);
      finalFiles.push(compressedFile);
      setFormData((prev) => ({
        ...prev,
        media: {
          ...prev.media,
          images: [...(prev.media.images || []), ...finalFiles],
        },
      }));
      finalFiles.pop();
      sizeMB_curr += Number((compressedFile.size / 1024 / 1024).toFixed(2));
    } catch (error) {
      console.error(
        `Compression failed for ${file.name}, using original image:`,
        error
      );
      finalFiles.push(file);
      setFormData((prev) => ({
        ...prev,
        media: {
          ...prev.media,
          images: [...(prev.media.images || []), ...finalFiles],
        },
      }));
      finalFiles.pop();
      sizeMB_curr += Number((file.size / 1024 / 1024).toFixed(2));
    } finally {
      setAllowedImages((prev) => prev - 1);
      allowedImages -= 1;
      setCompressionProgress(0);
      setCompressingMessage("");
    }
  }

  setSizeMB((prev) => {
    const prevNumber = Number(prev) || 0;
    const total = prevNumber + Number(sizeMB_curr);
    return Number(total.toFixed(2));
  });
};

const handleVideoChange = async (
  e,
  setFormData,
  setSizeMB,
  setAllowedVideos,
  allowedVideos
) => {
  const files = Array.from(e.target.files);
  const MAX_FILE_SIZE_MB = 30;
  const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/ogg"];

  const acceptedFiles = [];

  for (const file of files) {
    const sizeMB = file.size / (1024 * 1024);
    console.log(
      `Size of video ${file.name}: ${sizeMB.toFixed(2)}MB, Type: ${file.type}`
    );

    try {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(
          `${file.name} is not a supported video format. Please use MP4, WebM, or OGG.`
        );
        continue;
      }

      if (sizeMB > MAX_FILE_SIZE_MB) {
        alert(
          `${file.name} is of ${sizeMB.toFixed(
            2
          )}MB. Please use a video smaller than ${MAX_FILE_SIZE_MB}MB.`
        );
        continue;
      }

      if (allowedVideos <= 0) {
        alert("Maximum videos reached");
        break;
      }

      acceptedFiles.push(file);
      setSizeMB((prev) => Number((prev + sizeMB).toFixed(2)));
      setAllowedVideos((prev) => prev - 1);
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      alert(`Error processing ${file.name}: ${error.message}`);
    }
  }

  setFormData((prev) => ({
    ...prev,
    media: {
      ...prev.media,
      videos: [...(prev.media.videos || []), ...acceptedFiles],
    },
  }));
};

const removeImage = (index, setFormData, setAllowedImages) => {
  setAllowedImages((prev) => prev + 1);
  setFormData((prev) => ({
    ...prev,
    media: {
      ...prev.media,
      images: prev.media.images.filter((_, i) => i !== index),
    },
  }));
};

const removeVideo = (index, setFormData, setAllowedVideos) => {
  setAllowedVideos((prev) => prev + 1);
  setFormData((prev) => ({
    ...prev,
    media: {
      ...prev.media,
      videos: prev.media.videos.filter((_, i) => i !== index),
    },
  }));
};

const getImageSrc = (file) => {
  if (!file) return null;
  return file instanceof File || file instanceof Blob
    ? URL.createObjectURL(file)
    : file;
};

export default function MediaUploadPage({
  formData,
  setFormData,
  setSizeMB,
  allowed_images,
  allowed_videos,
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [allowedImages, setAllowedImages] = useState(allowed_images);
  const [allowedVideos, setAllowedVideos] = useState(allowed_videos);
  const [compressingMessage, setCompressingMessage] = useState("");
  const [compressionProgress, setCompressionProgress] = useState(0);

  // Clean up object URLs when component unmounts or media changes
  useEffect(() => {
    const imageUrls = (formData.media.images || []).map((file) =>
      getImageSrc(file)
    );
    const videoUrls = (formData.media.videos || []).map((file) =>
      getImageSrc(file)
    );
    return () => {
      imageUrls.forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      videoUrls.forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [formData.media.images, formData.media.videos]);

  return (
    <div className="media-upload-container">
      {compressingMessage && (
        <div className="compression-notification">
          <span>{compressingMessage}</span>
          <div className="compression-progress-bar">
            <div
              className="compression-progress-fill"
              style={{ width: `${compressionProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      <h2 className="media-upload-title">
        Upload images/videos of {allowed_images === 10 ? "community" : "artist"}
      </h2>
      <ul className="media-upload-instructions">
        {allowed_images == 10 && (
          <>
            <li>
              Upload images/videos related to the community, not to a particular
              artist.
            </li>
            <li>You can upload up to 10 images.</li>
            <li>You can upload up to 5 videos (each less than 30MB).</li>
          </>
        )}
        {allowed_images == 5 && (
          <>
            <li>Upload images/videos related to artist.</li>
            <li>You can upload up to 5 images.</li>
            <li>You can upload up to 2 videos (each less than 30MB).</li>
          </>
        )}
      </ul>

      {/* Image Upload */}
      <div className="media-upload-section image-section">
        <div className="media-upload-btn-row">
          <label className="media-upload-btn">
            <span className="media-upload-btn-icon">
              <svg
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block" }}
              >
                <path
                  d="M19 27V8M19 8L11 16M19 8L27 16"
                  stroke="#222"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 27V30C6 32.2091 7.79086 34 10 34H28C30.2091 34 32 32.2091 32 30V27"
                  stroke="#222"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            Add Image
            <input
              type="file"
              accept="image/*"
              className="hidden-input"
              multiple
              onChange={(e) =>
                handleImageChange(
                  e,
                  setFormData,
                  setSizeMB,
                  setAllowedImages,
                  allowedImages,
                  setCompressingMessage, 
                  setCompressionProgress,
                )
              }
            />
          </label>
          <span className="media-upload-count">
            {formData.media.images.length}/10
          </span>
        </div>
        <div className="media-upload-preview-row">
          <div className="media-carousel">
            {formData.media.images.map((file, index) => (
              <div key={index} className="media-carousel-item">
                <img
                  src={getImageSrc(file)}
                  alt={file.name}
                  className="media-image"
                  onClick={() => setSelectedImage(getImageSrc(file))}
                  onError={(e) =>
                    console.error(`Image preview error for ${file.name}:`, e)
                  }
                />
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() =>
                    removeImage(index, setFormData, setAllowedImages)
                  }
                >
                  <span>&times;</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Upload */}
      <div className="media-upload-section video-section">
        <div className="media-upload-btn-row">
          <label className="media-upload-btn">
            <span className="media-upload-btn-icon">
              <svg
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block" }}
              >
                <path
                  d="M19 27V8M19 8L11 16M19 8L27 16"
                  stroke="#222"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 27V30C6 32.2091 7.79086 34 10 34H28C30.2091 34 32 32.2091 32 30V27"
                  stroke="#222"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            Add Video
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              className="hidden-input"
              multiple
              onChange={(e) =>
                handleVideoChange(
                  e,
                  setFormData,
                  setSizeMB,
                  setAllowedVideos,
                  allowedVideos
                )
              }
            />
          </label>
          <span className="media-upload-count">
            {formData.media.videos.length}/5
          </span>
        </div>
        <div className="media-upload-preview-row">
          <div className="media-carousel">
            {formData.media.videos.map((file, index) => (
              <div key={index} className="media-carousel-item">
                <video
                  src={getImageSrc(file)}
                  className="media-video"
                  controls
                  muted
                  onError={(e) =>
                    console.error(`Video preview error for ${file.name}:`, e)
                  }
                />
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() =>
                    removeVideo(index, setFormData, setAllowedVideos)
                  }
                >
                  <span>&times;</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen modals (unchanged) */}
      {selectedImage && (
        <div
          className="fullscreen-modal"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full Size"
            className="fullscreen-image"
          />
        </div>
      )}
      {selectedVideo && (
        <div
          className="fullscreen-modal"
          onClick={() => setSelectedVideo(null)}
        >
          <video
            src={selectedVideo}
            className="fullscreen-video"
            controls
            autoPlay
          />
        </div>
      )}
    </div>
  );
}
