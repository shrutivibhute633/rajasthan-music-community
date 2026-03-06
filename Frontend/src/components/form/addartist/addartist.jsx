import React, { useState } from "react";
import ArtistForm from "../artistform/formartist";
import "./addartist.css";

export default function AddArtist({ formData, setFormData, setSizeMB }) {
  const [index, setIndex] = useState(1);
  // Add a new artist card
  const handleAddArtist = () => {
    setFormData((prev) => ({
      ...prev,
      artists: [
        ...prev.artists,
        {
          name: "",
          profilePicture: null,
          instrument: "",
          detail: "",
          media: { images: [], videos: [] },
          isActive: true,
          index: index,
        },
      ],
    }));
    setIndex((prev) => prev + 1);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAddArtist}
        className="add-artist-button"
      >
        <span className="add-artist-icon">
          {/* Plus in a circle SVG */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle
              cx="11"
              cy="11"
              r="11"
              fill="#fff"
              stroke="#b5853a"
              strokeWidth="2"
            />
            <path
              d="M11 6V16"
              stroke="#b5853a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6 11H16"
              stroke="#b5853a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        Add Artist
      </button>
      {formData.artists.map((artist) => (
        <div key={artist.index} className="artist-card">
          <div className={`dropdown ${artist.isActive ? "active" : ""}`}>
            <ArtistForm
              ArtistData={artist}
              setFormData={setFormData}
              index={artist.index}
              setSizeMB={setSizeMB}
            />
          </div>
        </div>
      ))}
    </>
  );
}
