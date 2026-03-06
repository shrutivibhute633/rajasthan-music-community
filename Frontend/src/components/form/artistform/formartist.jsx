import React, { useEffect, useState, useRef } from "react";
import { Plus, X, Maximize } from "lucide-react";
import MediaUploadPage from "../addmedia/formmedia";
import "./formartist.css";
import imageCompression from "browser-image-compression";

const ALL_INSTRUMENTS = [
  "Guitar",
  "Tabla",
  "Sitar",
  "Harmonium",
  "Dholak",
  "Violin",
  "Flute",
  "Sarangi",
  "Shehnai",
  "Keyboard",
  "Drums",
  "Bass",
  "Other",
];

export default function ArtistForm({
  ArtistData,
  setFormData,
  index,
  setSizeMB,
}) {
  const loaded = useRef(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [ArtistMedia, setArtistMedia] = useState({
    media: {
      images: [],
      videos: [],
    },
  });

  // Instrument input state
  const [instrumentInput, setInstrumentInput] = useState("");
  const [instrumentSuggestions, setInstrumentSuggestions] = useState([]);

  useEffect(() => {
    if (loaded.current) {
      setFormData((prev) => ({
        ...prev,
        artists: prev.artists.map((artist) =>
          artist.index === index
            ? {
                ...artist,
                media: {
                  images: ArtistMedia.media.images,
                  videos: ArtistMedia.media.videos,
                },
              }
            : artist
        ),
      }));
    }
  }, [ArtistMedia]);

  useEffect(() => {
    setArtistMedia({
      media: {
        images: ArtistData.media.images,
        videos: ArtistData.media.videos,
      },
    });
    loaded.current = true;
    // Initialize instrument input state
    setInstrumentInput("");
    setInstrumentSuggestions([]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      artists: prev.artists.map((artist) =>
        artist.index === index ? { ...artist, [name]: value } : artist
      ),
    }));
  };

  const addProfilePicture = async (e, setFormData, setSizeMB) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = {
      useWebWorker: true,
      fileType: "image/webp",
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const compressedSizeMB = compressedFile.size / 1024 / 1024;
      setFormData((prev) => ({
        ...prev,
        artists: prev.artists.map((artist) =>
          artist.index === index
            ? { ...artist, profilePicture: compressedFile }
            : artist
        ),
      }));
      setSizeMB((prev) => {
        const prevNumber = Number(prev) || 0;
        const total = prevNumber + Number(compressedSizeMB);
        return Number(total.toFixed(2));
      });
    } catch (error) {
      const originalSizeMB = file.size / 1024 / 1024;
      setFormData((prev) => ({
        ...prev,
        artists: prev.artists.map((artist) =>
          artist.index === index ? { ...artist, profilePicture: file } : artist
        ),
      }));
      setSizeMB((prev) => {
        const prevNumber = Number(prev) || 0;
        const total = prevNumber + Number(originalSizeMB);
        return Number(total.toFixed(2));
      });
    }
  };

  const removeprofilepicture = () => {
    setFormData((prev) => ({
      ...prev,
      artists: prev.artists.map((artist) =>
        artist.index === index ? { ...artist, profilePicture: null } : artist
      ),
    }));
  };

  const handleremoveArtist = () => {
    setFormData((prev) => ({
      ...prev,
      artists: prev.artists.filter((artist) => artist.index !== index),
    }));
  };

  const isArtistsValid =
    ArtistData.name &&
    ArtistData.instruments &&
    ArtistData.instruments.length > 0 &&
    ArtistData.profilePicture;

  const saveform = () => {
    if (!isArtistsValid) {
      alert("Please fill all required fields for each artist.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      artists: prev.artists.map((artist) =>
        artist.index === index ? { ...artist, isActive: false } : artist
      ),
    }));
  };

  const toggleshutter = () => {
    setFormData((prev) => ({
      ...prev,
      artists: prev.artists.map((artist) =>
        artist.index === index
          ? { ...artist, isActive: !artist.isActive }
          : artist
      ),
    }));
  };

  const getImageSrc = (image) => {
    if (!image) return null;
    return image instanceof File || image instanceof Blob
      ? URL.createObjectURL(image)
      : image;
  };
  const isActive = ArtistData.isActive;

  // --- Instrument Autocomplete Logic ---
  // Instruments are stored as an array in ArtistData.instruments
  const selectedInstruments = ArtistData.instruments || [];

  const handleInstrumentInput = (e) => {
    const value = e.target.value;
    setInstrumentInput(value);
    if (value.length > 0) {
      setInstrumentSuggestions(
        ALL_INSTRUMENTS.filter(
          (inst) =>
            inst.toLowerCase().startsWith(value.toLowerCase()) &&
            !selectedInstruments.includes(inst)
        )
      );
    } else {
      setInstrumentSuggestions([]);
    }
  };

  const addInstrument = (inst) => {
    setFormData((prev) => ({
      ...prev,
      artists: prev.artists.map((artist) =>
        artist.index === index
          ? {
              ...artist,
              instruments: [...(artist.instruments || []), inst],
            }
          : artist
      ),
    }));
    setInstrumentInput("");
    setInstrumentSuggestions([]);
  };

  const removeInstrument = (inst) => {
    setFormData((prev) => ({
      ...prev,
      artists: prev.artists.map((artist) =>
        artist.index === index
          ? {
              ...artist,
              instruments: (artist.instruments || []).filter((i) => i !== inst),
            }
          : artist
      ),
    }));
  };

  return (
    <div className={`dropdown${isActive ? " active" : ""}`}>
      <button
        type="button"
        className="dropdown-button"
        onClick={toggleshutter}
        aria-expanded={isActive}
        aria-controls={`artist-form-${ArtistData.id || index}`}
      >
        {ArtistData.name || "New Artist"} <span className="arrow">▼</span>
      </button>
      <div
        className="dropdown-content"
        id={`artist-form-${ArtistData.id || index}`}
        aria-hidden={!isActive}
      >
        <div className="card-container">
          <div className="form-grid">
            <div className="image-section">
              <span className="media-label-main">
                Profile Picture <span className="required-star">*</span>
              </span>
              <span className="media-desc">
                Upload an image that represents this artist
              </span>
              {ArtistData.profilePicture ? (
                <div className="media-item">
                  <img
                    src={getImageSrc(ArtistData.profilePicture)}
                    alt="Selected"
                    className="media-image-mainimage"
                    onClick={() =>
                      setSelectedImage(
                        URL.createObjectURL(ArtistData.profilePicture)
                      )
                    }
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={removeprofilepicture}
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="media-add-mainimage">
                  <span className="plus-sign">+</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden-input"
                    required
                    onChange={(e) =>
                      addProfilePicture(e, setFormData, setSizeMB)
                    }
                  />
                </label>
              )}
            </div>
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
            <div className="artist-input">
              <div>
                <label className="input-label">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  name="name"
                  value={ArtistData["name"]}
                  placeholder="Full Name"
                  required
                  className="input-text"
                  onChange={handleInputChange}
                />
              </div>
              <div className="instrument-section">
                <label className="input-label">
                  Instruments <span className="required-star">*</span>
                </label>
                <div className="instrument-autocomplete-wrapper">
                  <input
                    type="text"
                    placeholder="Type instrument name"
                    value={instrumentInput}
                    onChange={handleInstrumentInput}
                    className="input-text"
                    autoComplete="off"
                  />
                  {instrumentSuggestions.length > 0 && (
                    <ul className="instrument-suggestions">
                      {instrumentSuggestions.map((inst, idx) => (
                        <li
                          key={idx}
                          onClick={() => addInstrument(inst)}
                          className="instrument-suggestion"
                        >
                          {inst}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="instrument-tags">
                  {selectedInstruments.map((inst, idx) => (
                    <span className="instrument-tag" key={idx}>
                      {inst}
                      <span
                        className="instrument-remove"
                        onClick={() => removeInstrument(inst)}
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="input-label">Detail</label>
                <textarea
                  name="detail"
                  value={ArtistData["detail"]}
                  placeholder="Detail (Optional)"
                  className="textarea"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <MediaUploadPage
              formData={ArtistMedia}
              setFormData={setArtistMedia}
              setSizeMB={setSizeMB}
              allowed_images={5}
              allowed_videos={2}
            />
            <button type="button" className="save-button" onClick={saveform}>
              Save
            </button>
            <button
              type="button"
              className="remove-button"
              onClick={handleremoveArtist}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
