import React, { useState, useEffect } from "react";
import SiteDetailsPage from "../../components/form/detail/formdetail";
import AddressLocationPage from "../../components/form/adress/formadress";
import MediaUploadPage from "../../components/form/addmedia/formmedia";
import AddArtist from "../../components/form/addartist/addartist";
import "./form.css";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar/navbar";

export default function CommunityForm() {
  const [SiteformData, setSiteFormData] = useState({
    mainImage: null,
    community: "",
    groupName: "",
    quickInfo: "",
    detail: "",
    address: "",
    latitude: "",
    longitude: "",
    media: {
      images: [],
      videos: [],
    },
    access: [],
    instruments: [],
    artists: [],
  });
  const [sizeMB, setSizeMB] = useState(0);
  const [page, setPage] = useState(0);
  const [canGoNext, setCanGoNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGroupNameChanged, setIsGroupNameChanged] = useState(false);

  const handleInputChange = (e) => {
    if (sizeMB > 1024) {
      alert(
        `Media size exceeds 1GB (current size:${
          sizeMB / 1024
        }GB ). Remove some images/videos.`
      );
      return;
    }
    const { name, value } = e.target;
    setSiteFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !SiteformData.community ||
      !SiteformData.groupName ||
      !SiteformData.quickInfo ||
      !SiteformData.address ||
      !SiteformData.latitude ||
      !SiteformData.longitude ||
      !SiteformData.mainImage ||
      SiteformData.access.length === 0
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const isArtistsValid = SiteformData.artists.every((artist) => {
      return artist.name && artist.profilePicture && artist.instruments;
    });

    if (!isArtistsValid) {
      alert("Please fill all required fields for each artist.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("community", SiteformData.community);
    formDataToSend.append("groupName", SiteformData.groupName);
    formDataToSend.append("quickInfo", SiteformData.quickInfo);
    formDataToSend.append("detail", SiteformData.detail);
    formDataToSend.append("address", SiteformData.address);
    formDataToSend.append(
      "latitude",
      parseFloat(SiteformData.latitude).toFixed(6)
    );
    formDataToSend.append(
      "longitude",
      parseFloat(SiteformData.longitude).toFixed(6)
    );

    // --- MAIN IMAGE ---
    // If using browser-image-compression, it's webp; otherwise, use file.name or fallback
    let mainImageName = "mainImage.webp";
    if (SiteformData.mainImage && SiteformData.mainImage.name) {
      mainImageName = SiteformData.mainImage.name;
    }
    formDataToSend.append("mainImage", SiteformData.mainImage, mainImageName);

    // --- MEDIA IMAGES ---
    SiteformData.media.images.forEach((image, index) => {
      let imageName = image.name ? image.name : `media_image_${index}.webp`;
      formDataToSend.append(`media.images[${index}]`, image, imageName);
    });

    // --- MEDIA VIDEOS ---
    SiteformData.media.videos.forEach((video, index) => {
      let videoName = video.name ? video.name : `media_video_${index}.mp4`;
      formDataToSend.append(`media.videos[${index}]`, video, videoName);
    });

    // --- ACCESS NUMBERS ---
    SiteformData.access.forEach((number, index) => {
      formDataToSend.append(`access[${index}]`, number);
    });

    // --- ARTISTS ---
    const communityInstrumentsSet = new Set();
    SiteformData.artists.forEach((artist, artistIndex) => {
      formDataToSend.append(`artists[${artistIndex}].name`, artist.name);

      // --- ARTIST PROFILE PICTURE ---
      let profilePicName =
        artist.profilePicture && artist.profilePicture.name
          ? artist.profilePicture.name
          : `artist_${artistIndex}_profile.webp`;
      formDataToSend.append(
        `artists[${artistIndex}].profilePicture`,
        artist.profilePicture,
        profilePicName
      );

      const uniqueInstruments = Array.from(new Set(artist.instruments || []));

      uniqueInstruments.forEach((instrument, instIdx) => {
        formDataToSend.append(
          `artists[${artistIndex}].instruments[${instIdx}]`,
          instrument
        );
        communityInstrumentsSet.add(instrument);
      });

      formDataToSend.append(
        `artists[${artistIndex}].detail`,
        artist.detail || ""
      );

      // --- ARTIST MEDIA IMAGES ---
      if (artist.media && artist.media.images) {
        artist.media.images.forEach((image, imageIndex) => {
          let artistImageName = image.name
            ? image.name
            : `artist_${artistIndex}_media_image_${imageIndex}.webp`;
          formDataToSend.append(
            `artists[${artistIndex}].media.images[${imageIndex}]`,
            image,
            artistImageName
          );
        });
      }

      // --- ARTIST MEDIA VIDEOS ---
      if (artist.media && artist.media.videos) {
        artist.media.videos.forEach((video, videoIndex) => {
          let artistVideoName = video.name
            ? video.name
            : `artist_${artistIndex}_media_video_${videoIndex}.mp4`;
          formDataToSend.append(
            `artists[${artistIndex}].media.videos[${videoIndex}]`,
            video,
            artistVideoName
          );
        });
      }
    });

    // --- INSTRUMENTS ---
    communityInstrumentsSet.forEach((instrument, index) => {
      formDataToSend.append(`instruments[${index}]`, instrument);
    }
    );
 

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BE_URL}createsite/`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );
      console.log("Response:", response);

      if (response.ok) {
        const data = await response.json();
        console.log("Success data:", data);
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to create site"}`);
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      alert(`Error uploading media: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    if (isGroupNameChanged) {
      setIsGroupNameChanged(false);
      try {
        let temp = canGoNext;
        setCanGoNext(false);
        const response = await fetch(
          `${import.meta.env.VITE_BE_URL}groupNameCheck?groupName=${
            SiteformData.groupName
          }&community=${SiteformData.community}`,
          { method: "GET" }
        );
        setCanGoNext(temp);
        if (!response.ok) {
          alert("Some error occurred, try again");
          return;
        }
        const data = await response.json();
        if (data.exists) {
          alert("Group name already taken. Change it.");
          return;
        }
        setPage(newPage);
      } catch (error) {
        console.error("Error checking group name:", error);
        alert("Some error occurred, try again");
      }
    }
    setPage(newPage);
  };

  useEffect(() => {
    if (page === 0) {
      const requiredFieldsFilled =
        SiteformData.mainImage &&
        SiteformData.community &&
        SiteformData.groupName &&
        SiteformData.quickInfo &&
        SiteformData.access.length > 0;
      setCanGoNext(requiredFieldsFilled);
    } else if (page === 1) {
      const requiredFieldsFilled = SiteformData.address;
      setCanGoNext(requiredFieldsFilled);
    } else {
      setCanGoNext(true);
    }
  }, [SiteformData, page]);

  return (
    <form className="community-form">
      <Navbar />
      {isLoading && (
        <div className="community-form-loading-overlay">
          <div className="community-form-loading-spinner"></div>
        </div>
      )}

      {isSubmitted && !isLoading && (
        <div className="community-form-success-modal-overlay">
          <div className="community-form-success-modal">
            <div className="community-form-success-modal-content">
              <h2>Submission Successful</h2>
              <p>
                Your request has been sent. You will be informed when it will be
                approved.
              </p>
              <Link to="/">
                <button className="community-form-success-modal-button">
                  OK
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="community-form-progress-container">
        <div className="community-form-progress-bar">
          <div className="community-form-progress-background"></div>
          <div
            className="community-form-progress"
            style={{ width: `${(page / 3) * 100}%` }}
          ></div>
        </div>
        <div className="community-form-progress-nodes">
          <span
            className={`community-form-node ${page >= 0 ? "active" : ""}`}
            data-label="Details"
          >
            1
          </span>
          <span
            className={`community-form-node ${page >= 1 ? "active" : ""}`}
            data-label="Address"
          >
            2
          </span>
          <span
            className={`community-form-node ${page >= 2 ? "active" : ""}`}
            data-label="Media"
          >
            3
          </span>
          <span
            className={`community-form-node ${page === 3 ? "active" : ""}`}
            data-label="Artists"
          >
            4
          </span>
        </div>
      </div>

      <div className="community-form-container">
        {page === 0 && (
          <SiteDetailsPage
            formData={SiteformData}
            handleInputChange={handleInputChange}
            setFormData={setSiteFormData}
            setIsGroupNameChanged={setIsGroupNameChanged}
            setSizeMB={setSizeMB}
          />
        )}

        {page === 1 && (
          <AddressLocationPage
            formData={SiteformData}
            handleInputChange={handleInputChange}
          />
        )}

        {page === 2 && (
          <MediaUploadPage
            formData={SiteformData}
            setFormData={setSiteFormData}
            setSizeMB={setSizeMB}
            allowed_images={10}
            allowed_videos={5}
          />
        )}

        {page === 3 && (
          <AddArtist
            formData={SiteformData}
            setFormData={setSiteFormData}
            setSizeMB={setSizeMB}
          />
        )}
      </div>
      <div className="community-form-navigation-buttons">
        {page > 0 && (
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            className="community-form-navigation-button nav-prev"
          >
            <span className="nav-arrow">
              {/* Left Arrow SVG */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M17 22L11 14L17 6"
                  stroke="#ae6d0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="nav-label">Previous</span>
          </button>
        )}
        {page === 0 && <div></div>}
        {page < 3 && (
          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={!canGoNext || isLoading || isSubmitted}
            className="community-form-navigation-button nav-next"
          >
            <span className="nav-label">Next</span>
            <span className="nav-arrow">
              {/* Right Arrow SVG */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M11 6L17 14L11 22"
                  stroke="#ae6d0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        )}
      </div>
      <div className="community-form-submit-button-container">
        {page === 3 && (
          <button
            type="submit"
            className="community-form-submit-button"
            onClick={handleSubmit}
            disabled={isLoading || isSubmitted}
          >
            Submit
          </button>
        )}
      </div>
    </form>
  );
}
