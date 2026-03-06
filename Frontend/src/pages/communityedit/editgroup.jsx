import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SiteDetailsPage from "../../components/form/detail/formdetail";
import AddressLocationPage from "../../components/form/adress/formadress";
import MediaUploadPage from "../../components/form/addmedia/formmedia";
import AddArtist from "../../components/form/addartist/addartist";
import API from "../../../api"; // Assuming this is your Axios instance
import "./editgroup.css";
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

export default function EditGroup() {
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

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setIsLoading(true);
        const response = await API.get(`/detail/${id}/`);
        const data = response.data;
        console.log("Fetched data:", data);
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
            images: data.moreImages ? data.moreImages.map((img) => img.image) : [],
            videos: data.videos || [],
          },
          access: data.access ? data.access.split(",") : [],
          instruments: data.instruments ? data.instruments.split(",") : [],
          artists: data.artists
            ? data.artists.map((artist, index) => ({
                index: artist.id,
                name: artist.name || "",
                profilePicture: artist.profilePicture || "",
                instrument: artist.instrument || "",
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
        console.error("Error fetching group data:", error.response ? error.response.data : error.message);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
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
      return;
    }

    if (!formData.artists.every((artist) => artist.name && artist.profilePicture && artist.instrument)) {
      alert("Please fill all required fields for each artist.");
      return;
    }

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
    formDataToSend.append("quickInfo", formData.quickInfo);
    formDataToSend.append("detail", formData.detail);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("latitude", parseFloat(formData.latitude).toFixed(6));
    formDataToSend.append("longitude", parseFloat(formData.longitude).toFixed(6));

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
    for (let artistIndex = 0; artistIndex < formData.artists.length; artistIndex++) {
      const artist = formData.artists[artistIndex];
      formDataToSend.append(`artists[${artistIndex}].name`, artist.name);

      if (artist.profilePicture instanceof File) {
        formDataToSend.append(`artists[${artistIndex}].profilePicture`, artist.profilePicture);
      } else if (typeof artist.profilePicture === "string") {
        const profilePictureFile = await fetchMediaAsFile(artist.profilePicture);
        if (!profilePictureFile) {
          alert(`Failed to fetch profile picture for artist ${artistIndex}.`);
          return;
        }
        formDataToSend.append(`artists[${artistIndex}].profilePicture`, profilePictureFile);
      }

      formDataToSend.append(`artists[${artistIndex}].instrument`, artist.instrument);
      formDataToSend.append(`artists[${artistIndex}].detail`, artist.detail || "");

      // Handle artist media images
      for (let imgIndex = 0; imgIndex < (artist.media?.images?.length || 0); imgIndex++) {
        const image = artist.media.images[imgIndex];
        if (image instanceof File) {
          formDataToSend.append(`artists[${artistIndex}].media.images[${imgIndex}]`, image);
        } else if (typeof image === "string") {
          const imageFile = await fetchMediaAsFile(image);
          if (!imageFile) {
            alert(`Failed to fetch artist ${artistIndex} image at index ${imgIndex}.`);
            return;
          }
          formDataToSend.append(`artists[${artistIndex}].media.images[${imgIndex}]`, imageFile);
        }
      }

      // Handle artist media videos
      for (let vidIndex = 0; vidIndex < (artist.media?.videos?.length || 0); vidIndex++) {
        const video = artist.media.videos[vidIndex];
        if (video instanceof File) {
          formDataToSend.append(`artists[${artistIndex}].media.videos[${vidIndex}]`, video);
        } else if (typeof video === "string") {
          const videoFile = await fetchMediaAsFile(video);
          if (!videoFile) {
            alert(`Failed to fetch artist ${artistIndex} video at index ${vidIndex}.`);
            return;
          }
          formDataToSend.append(`artists[${artistIndex}].media.videos[${vidIndex}]`, videoFile);
        }
      }
    }

    setIsLoading(true);
    try{
    const response = await fetch(`${import.meta.env.VITE_BE_URL}detail/${id}/`, {
        method: "PUT",
        body: formDataToSend,
        credentials: "include", 
      });
      const successData = response.data; // Access data directly
      console.log("Update success:", successData);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Update error:", error.response ? error.response.data : error.message);
      alert(`Error updating data: ${error.response ? error.response.data.error || error.message : error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkGroupName = async (groupName, community) => {
    try {
      const response = await API.get(`/groupNameCheck?groupName=${groupName}&community=${community}`);
      const data = response.data;
      if (data.exists) {
        alert("Group name already taken. Please choose another.");
        setIsGroupNameValid(false);
        return false;
      }
      setIsGroupNameValid(true);
      return true;
    } catch (error) {
      console.error("Error checking group name:", error.response ? error.response.data : error.message);
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

  return (
    <form className="edit-group-form">
        <Navbar />
      {isLoading && (
        <div className="edit-group-loading-overlay">
          <div className="edit-group-spinner"></div>
        </div>
      )}
      {isSubmitted && (
        <div className="edit-group-loading-overlay">
          <div className="edit-group-modal">
            <div className="edit-group-modal-content">
              <h2>Update Successful</h2>
              <p>Your group details have been updated successfully.</p>
              <Link to="/">
                <button className="edit-group-modal-button">OK</button>
              </Link>
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
          <AddressLocationPage formData={formData} handleInputChange={handleInputChange} />
          <MediaUploadPage formData={formData} setFormData={setFormData} />
          <AddArtist formData={formData} setFormData={setFormData} />
        <div className="edit-group-submit-button-container">
          <button
            type="submit"
            className="edit-group-submit-button"
            disabled={isLoading || isSubmitted || !isGroupNameValid}
            onClick={handleSubmit}
          >
            Update Group
          </button>
        </div>
      </div>
    </form>
  );
}
