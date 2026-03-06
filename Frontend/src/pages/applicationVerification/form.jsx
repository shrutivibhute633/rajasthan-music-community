import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SiteDetailsPage from "../../components/form/detail/formdetail";
import AddressLocationPage from "../../components/form/adress/formadress";
import MediaUploadPage from "../../components/form/addmedia/formmedia";
import AddArtist from "../../components/form/addartist/addartist";
import API from "../../../api"; // Assuming this is your Axios instance
import "./form.css";
import Navbar from "../../components/navbar/navbar";

const fetchMediaAsFile = async (mediaUrl) => {
  try {
    const response = await fetch(mediaUrl);
    if (!response.ok) throw new Error(`Failed to fetch media: ${mediaUrl}`);
    const blob = await response.blob();
    const fileName = mediaUrl.split("/").pop().split("?")[0];
    return new File([blob], fileName, { type: blob.type });
  } catch (error) {
    console.error("Error fetching media:", error);
    return null;
  }
};

export default function ApplicationVerification() {
  const { id } = useParams(); // Get the dynamic ID from URL
  const [formData, setFormData] = useState({
    mainImage: null,
    community: "",
    groupName: "",
    quickInfo: "",
    detail: "",
    address: "",
    latitude: "",
    longitude: "",
    media: { images: [], videos: [] },
    access: [],
    instruments: [],
    artists: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGroupNameValid, setIsGroupNameValid] = useState(true);
  const [status, setStatus] = useState("approved");
  const [notexist, setNotExist] = useState(false);

  // NEW: Admin token state
  const [adminToken, setAdminToken] = useState("");
  // NEW: Approve/Reject popup state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(""); // "approve" or "reject"
  const [actionLoading, setActionLoading] = useState(false);

  // On mount, fetch admin token
  useEffect(() => {
    const fetchAdminToken = async () => {
      try {
        const res = await API.post("/verification/get_token/");
        setAdminToken(res.data.token);
      } catch (err) {
        console.error("Failed to fetch admin token", err);
        alert("Failed to get admin token. Please reload or contact support.");
      }
    };
    fetchAdminToken();
  }, []);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setIsLoading(true);
        const token = adminToken; // Use your token from state or context
        const response = await fetch(
          `${import.meta.env.VITE_BE_URL}detail/${id}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          setIsLoading(false);
          if (errorData.error === "Site not found") {
            setNotExist(true);
          }
          else
          {
            throw new Error(errorData.error || "Unknown error");
          }
          return;
        }
        const data = await response.json();
        console.log("Fetched group data:", data);
        setFormData({
          mainImage: data.mainImage,
          community: data.community || "",
          groupName: data.groupName || "",
          quickInfo: data.quickInfo || "",
          detail: data.detail || "",
          address: data.address || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
          media: {
            images: data.moreImages
              ? data.moreImages.map((img) => img.image)
              : [],
            videos: data.videos || [],
          },
          access: data.access ? data.access.split(",") : [],
          instruments: data.instruments ? data.instruments.split(",") : [],
          artists: data.artists
            ? data.artists.map((artist, index) => ({
                index: artist.id,
                name: artist.name || "",
                profilePicture: artist.profilePicture || "",
                instruments: artist.instruments || "",
                detail: artist.detail || "",
                media: {
                  images: artist.artistMoreImages
                    ? artist.artistMoreImages.map((img) => img.image)
                    : [],
                  videos: artist.artistVideos || [],
                },
              }))
            : [],
        });
      } catch (error) {
        console.error(
          "Error fetching group data:",
          error.response ? error.response.data : error.message
        );
        alert("Failed to load group details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchGroupData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFormData = (formData) => {
    if (
      !formData.community ||
      !formData.groupName ||
      !formData.quickInfo ||
      !formData.address ||
      !formData.latitude ||
      !formData.longitude ||
      !formData.mainImage ||
      formData.access.length === 0
    ) {
      alert("Please fill all required fields.");
      return false;
    }

    if (
      !formData.artists.every(
        (artist) => artist.name && artist.profilePicture && artist.instruments
      )
    ) {
      alert("Please fill all required fields for each artist.");
      return false;
    }

    return true;
  };

  const handleApprove = async () => {
    const formDataToSend = new FormData();

    // Handle mainImage
    if (formData.mainImage instanceof File) {
      formDataToSend.append("mainImage", formData.mainImage);
    } else if (typeof formData.mainImage === "string") {
      const mainImageFile = await fetchMediaAsFile(formData.mainImage);
      if (!mainImageFile) {
        alert("Failed to fetch main image.");
        return;
      }
      formDataToSend.append("mainImage", mainImageFile);
    }

    // Append scalar fields
    formDataToSend.append("community", formData.community);
    formDataToSend.append("groupName", formData.groupName);
    formDataToSend.append("verified", true);
    formDataToSend.append("quickInfo", formData.quickInfo);
    formDataToSend.append("detail", formData.detail);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("latitude", parseFloat(formData.latitude).toFixed(6));
    formDataToSend.append(
      "longitude",
      parseFloat(formData.longitude).toFixed(6)
    );

    // Handle media images
    for (let index = 0; index < formData.media.images.length; index++) {
      const image = formData.media.images[index];
      if (image instanceof File) {
        formDataToSend.append(`media.images[${index}]`, image);
      } else if (typeof image === "string") {
        const imageFile = await fetchMediaAsFile(image);
        if (!imageFile) {
          alert(`Failed to fetch media image at index ${index}.`);
          return;
        }
        formDataToSend.append(`media.images[${index}]`, imageFile);
      }
    }

    // Handle media videos
    for (let index = 0; index < formData.media.videos.length; index++) {
      const video = formData.media.videos[index];
      if (video instanceof File) {
        formDataToSend.append(`media.videos[${index}]`, video);
      } else if (typeof video === "string") {
        const videoFile = await fetchMediaAsFile(video);
        if (!videoFile) {
          alert(`Failed to fetch media video at index ${index}.`);
          return;
        }
        formDataToSend.append(`media.videos[${index}]`, videoFile);
      }
    }

    // Append access
    formData.access.forEach((number, index) => {
      formDataToSend.append(`access[${index}]`, number);
    });

    // Handle artists
    const communityInstrumentsSet = new Set();
    for (
      let artistIndex = 0;
      artistIndex < formData.artists.length;
      artistIndex++
    ) {
      const artist = formData.artists[artistIndex];
      formDataToSend.append(`artists[${artistIndex}].name`, artist.name);

      if (artist.profilePicture instanceof File) {
        formDataToSend.append(
          `artists[${artistIndex}].profilePicture`,
          artist.profilePicture
        );
      } else if (typeof artist.profilePicture === "string") {
        const profilePictureFile = await fetchMediaAsFile(
          artist.profilePicture
        );
        if (!profilePictureFile) {
          alert(`Failed to fetch profile picture for artist ${artistIndex}.`);
          return;
        }
        formDataToSend.append(
          `artists[${artistIndex}].profilePicture`,
          profilePictureFile
        );
      }

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

      // Handle artist media images
      for (
        let imgIndex = 0;
        imgIndex < (artist.media?.images?.length || 0);
        imgIndex++
      ) {
        const image = artist.media.images[imgIndex];
        if (image instanceof File) {
          formDataToSend.append(
            `artists[${artistIndex}].media.images[${imgIndex}]`,
            image
          );
        } else if (typeof image === "string") {
          const imageFile = await fetchMediaAsFile(image);
          if (!imageFile) {
            alert(
              `Failed to fetch artist ${artistIndex} image at index ${imgIndex}.`
            );
            return;
          }
          formDataToSend.append(
            `artists[${artistIndex}].media.images[${imgIndex}]`,
            imageFile
          );
        }
      }

      // Handle artist media videos
      for (
        let vidIndex = 0;
        vidIndex < (artist.media?.videos?.length || 0);
        vidIndex++
      ) {
        const video = artist.media.videos[vidIndex];
        if (video instanceof File) {
          formDataToSend.append(
            `artists[${artistIndex}].media.videos[${vidIndex}]`,
            video
          );
        } else if (typeof video === "string") {
          const videoFile = await fetchMediaAsFile(video);
          if (!videoFile) {
            alert(
              `Failed to fetch artist ${artistIndex} video at index ${vidIndex}.`
            );
            return;
          }
          formDataToSend.append(
            `artists[${artistIndex}].media.videos[${vidIndex}]`,
            videoFile
          );
        }
      }
    }

    // --- INSTRUMENTS ---
    communityInstrumentsSet.forEach((instrument, index) => {
      formDataToSend.append(`instruments[${index}]`, instrument);
    }
    );

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BE_URL}verify_application/approve/${id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${adminToken}`, // Include the token here
          },
          body: formDataToSend,
          credentials: "include",
        }
      );
      const successData = response.data; // Access data directly
      if (!response.ok) {
        const errorData = await response.json();
        setIsLoading(false);
        throw new Error(errorData.error || "Unknown error");
      }
      else {
        setIsSubmitted(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(
        "Error occured",
        error.response ? error.response.data : error.message
      );
      alert(
        `Error occured: ${
          error.response
            ? error.response.data.error || error.message
            : error.message
        }`
      );
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setStatus("rejected");
    setIsLoading(true);

    try {
      // Prepare access array as JSON
      const body = JSON.stringify({ access: formData.access });

      const response = await fetch(
        `${import.meta.env.VITE_BE_URL}verify_application/reject/${id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`, // Include the token here
          },
          credentials: "include",
          body: body, // send only the access array
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setIsLoading(false);
        throw new Error(errorData.error || "Unknown error");
      }
      else
      {
        setIsSubmitted(true);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(
        "Error occurred",
        error.response ? error.response.data : error.message
      );
      alert(
        `Error occurred: ${
          error.response
            ? error.response.data.error || error.message
            : error.message
        }`
      );
    }
    finally {
      setIsLoading(false);
    }
  };

  const checkGroupName = async (groupName, community) => {
    try {
      const response = await API.get(
        `/groupNameCheck?groupName=${groupName}&community=${community}`
      );
      const data = response.data;
      if (data.exists) {
        alert("Group name already taken. Please choose another.");
        setIsGroupNameValid(false);
        return false;
      }
      setIsGroupNameValid(true);
      return true;
    } catch (error) {
      console.error(
        "Error checking group name:",
        error.response ? error.response.data : error.message
      );
      alert("Error checking group name. Try again.");
      return false;
    }
  };

  const handleGroupNameChange = async (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, groupName: value }));
    if (value && formData.community) {
      await checkGroupName(value, formData.community);
    }
  };

  // --- APPROVE/REJECT LOGIC ---

  const handleApproveReject = (action) => {
    setConfirmAction(action); // "approve" or "reject"
    if (action === "approve") {
      if (!validateFormData(formData)) {
        return;
      }
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    if (confirmAction === "approve") {
      await handleApprove();
    } else if (confirmAction === "reject") {
      await handleReject();
    }
  };

  return (
    <form className="edit-group-form">
      <Navbar />
      {isSubmitted && (
        <div className="edit-group-loading-overlay">
          <div className="edit-group-modal">
            <div className="edit-group-modal-content">
              {status === "approved" ? (
                <p>Application Approved</p>
              ) : (
                <p>Application Rejected</p>
              )}
              <Link to="/">
                <button className="edit-group-modal-button">OK</button>
              </Link>
            </div>
          </div>
        </div>
      )}
      {notexist && (
        <div className="edit-group-loading-overlay">
          <div className="edit-group-modal">
            <div className="edit-group-modal-content">
              Community with id: {id} does not exist
              <Link to="/">
                <button className="edit-group-modal-button">OK</button>
              </Link>
            </div>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="edit-group-loading-overlay">
          <div className="edit-group-spinner"></div>
        </div>
      )}
      {showConfirm && (
        <div className="edit-group-loading-overlay">
          <div className="edit-group-modal">
            <div className="edit-group-modal-content">
              <h2>
                {confirmAction === "approve"
                  ? "Do you want to approve this application?"
                  : "Do you want to reject this application?"}
              </h2>
              <div style={{ display: "flex", gap: "18px", marginTop: "22px" }}>
                <button
                  type="button"
                  className="edit-group-modal-button"
                  onClick={handleConfirm}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="edit-group-modal-button"
                  style={{ background: "#eee", color: "#333" }}
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="edit-group-form-container">
        <SiteDetailsPage
          formData={formData}
          handleInputChange={handleInputChange}
          setFormData={setFormData}
          setIsGroupNameChanged={handleGroupNameChange}
        />
        <AddressLocationPage
          formData={formData}
          handleInputChange={handleInputChange}
        />
        <MediaUploadPage formData={formData} setFormData={setFormData} />
        <AddArtist formData={formData} setFormData={setFormData} />
        {/* Approve/Reject Buttons */}
        <div
          className="edit-group-approve-reject-buttons"
          style={{
            display: "flex",
            gap: "20vw",
            marginTop: "34px",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            className="edit-group-reject-button"
            onClick={() => handleApproveReject("reject")}
            disabled={actionLoading}
          >
            <svg
              className="reject-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ marginRight: 8, verticalAlign: "middle" }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="10" r="10" fill="#e74c3c" />
              <path
                d="M7 7L13 13M13 7L7 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Reject
          </button>
          <button
            type="button"
            className="edit-group-approve-button"
            onClick={() => handleApproveReject("approve")}
            disabled={actionLoading}
          >
            <svg
              className="approve-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ marginRight: 8, verticalAlign: "middle" }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="10" r="10" fill="#27ae60" />
              <path
                d="M6 10.5L9 13.5L14 8.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Approve
          </button>
        </div>
      </div>
    </form>
  );
}
