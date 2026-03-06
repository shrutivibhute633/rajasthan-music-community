import React from "react";
import { useState } from "react";
import { Plus, X, Maximize } from "lucide-react";
import "./formdetail.css";
import imageCompression from "browser-image-compression";

const validateMobileNumber = (number) => {
  const regex = /^\d{10}$/;
  return regex.test(number);
};

const handleDeleteMobileNumber = (index, formData, setFormData) => {
  const updatedaccess = formData.access.filter((_, i) => i !== index);
  setFormData((prev) => ({ ...prev, access: updatedaccess }));
};

const handleEditMobileNumber = (
  index,
  formData,
  setMobileNumberError,
  setEditIndex,
  setMobileNumberInput
) => {
  setMobileNumberInput(formData.access[index]);
  setEditIndex(index);
  setMobileNumberError("");
};

export default function SiteDetailsPage({
  formData,
  handleInputChange,
  setFormData,
  setIsGroupNameChanged,
  setSizeMB,
}) {
  const [mobileNumberError, setMobileNumberError] = useState("");
  const [mobileNumberInput, setMobileNumberInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const handleImageChange = async (e, setFormData, setSizeMB) => {
    const file = e.target.files[0]; // Get the first selected file
    if (!file) return;

    const options = {
      useWebWorker: true,
      fileType: "image/webp", // Compress to WebP format
    };

    try {
      // Attempt compression
      const compressedFile = await imageCompression(file, options);
      const compressedSizeMB = compressedFile.size / 1024 / 1024;

      // Update form data with compressed image
      setFormData((prev) => ({ ...prev, mainImage: compressedFile }));
      // Add compressed size to total
      setSizeMB((prev) => {
        const prevNumber = Number(prev) || 0; // Ensure it's a number
        const total = prevNumber + Number(compressedSizeMB);
        return Number(total.toFixed(2)); // Round to 2 decimals
      });
    } catch (error) {
      // Fallback to original image if compression fails
      console.error("Compression failed. Using original image:", error);
      const originalSizeMB = file.size / 1024 / 1024;

      // Update form data with original image
      setFormData((prev) => ({ ...prev, mainImage: file }));
      // Add original size to total
      setSizeMB((prev) => {
        const prevNumber = Number(prev) || 0; // Ensure it's a number
        const total = prevNumber + Number(originalSizeMB);
        return Number(total.toFixed(2)); // Round to 2 decimals
      });
    }
  };

  const handleAddMobileNumber = () => {
    if (!validateMobileNumber(mobileNumberInput)) {
      setMobileNumberError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (editIndex !== null) {
      const updatedaccess = [...formData.access];
      updatedaccess[editIndex] = mobileNumberInput;
      setFormData((prev) => ({ ...prev, access: updatedaccess }));
      setEditIndex(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        access: [...prev.access, mobileNumberInput],
      }));
    }

    setMobileNumberInput("");
    setMobileNumberError("");
  };

  const getImageSrc = (image) => {
    if (!image) return null;
    // Check if image is a File/Blob (for creation) or a string URL (for editing)
    return image instanceof File || image instanceof Blob
      ? URL.createObjectURL(image)
      : image; // Use URL string directly
  };

  return (
    <div className="card-container">
      <div className="form-grid">
        <div className="community-detail-main-image-section">
          <span className="community-detail-main-image-label">Main Image</span>
          <span className="community-detail-main-image-directive">
            upload image which represent your community best
          </span>
          {formData.mainImage ? (
            <div className="media-item">
              <img
                src={getImageSrc(formData.mainImage)}
                alt="Selected"
                className="media-image-mainimage"
                onClick={() =>
                  setSelectedImage(URL.createObjectURL(formData.mainImage))
                }
              />
              <button
                className="remove-btn"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, mainImage: null }))
                }
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label className="media-add-mainimage">
              <Plus size={24} />
              <input
                type="file"
                accept="image/*"
                className="hidden-input"
                required
                onChange={(e) => handleImageChange(e, setFormData, setSizeMB)}
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
        <div className="form-responsive-container">
          <div className="form-field">
            <label htmlFor="community" className="field-label">
              Community Name <span className="required">*</span>
            </label>
            <input
              id="community"
              name="community"
              value={formData["community"]}
              placeholder="Value"
              required
              className="input-text"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="groupName" className="field-label">
              Group Name <span className="required">*</span>
            </label>
            <input
              id="groupName"
              name="groupName"
              value={formData["groupName"]}
              placeholder="give your group a good name"
              required
              className="input-text"
              onChange={(e) => {
                handleInputChange(e);
                setIsGroupNameChanged(true);
              }}
            />
          </div>

          <div className="form-field">
            <label htmlFor="quickInfo" className="field-label">
              Quick information <span className="required">*</span>
            </label>
            <textarea
              id="quickInfo"
              name="quickInfo"
              value={formData["quickInfo"]}
              placeholder="small description about your group"
              required
              className="textarea"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="detail" className="field-label">
              Detail information
            </label>
            <textarea
              id="detail"
              name="detail"
              value={formData["detail"]}
              placeholder="Detailed description about your group (optional)"
              className="textarea"
              onChange={handleInputChange}
            />
          </div>

          <div className="mobile-number-section">
            <div className="mobile-number-info">
              <span className="required">*</span>
              <span className="mobile-info-text">
                Enter all mobile numbers you want to use for login access (e.g.,
                all community members).
              </span>
            </div>
            <div className="mobile-number-input-row">
              <label htmlFor="mobileNumber" className="mobile-number-label">
                Mobile No:
              </label>
              <div className="mobilenumber-arrangement-short">
                <input
                  type="tel"
                  id="mobileNumber"
                  value={mobileNumberInput}
                  onChange={(e) => {
                    setMobileNumberInput(e.target.value);
                    setMobileNumberError("");
                  }}
                  onBlur={() => {
                    if (
                      mobileNumberInput &&
                      !validateMobileNumber(mobileNumberInput)
                    ) {
                      setMobileNumberError(
                        "Please enter a valid 10-digit mobile number."
                      );
                    }
                  }}
                  maxLength={10}
                  placeholder=""
                  className={`mobile-number-input ${
                    mobileNumberError ? "error" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddMobileNumber}
                  className="add-mobile-number-btn"
                >
                  {editIndex !== null ? "Update" : "ADD"}
                </button>
              </div>
            </div>
            {mobileNumberError && (
              <p className="mobile-number-error">{mobileNumberError}</p>
            )}
            {!mobileNumberError && (
              <p className="mobile-number-error-space">-</p>
            )}
            <div className="mobile-number-list">
              <ul>
                {formData.access.map((number, index) => (
                  <li key={index} className="mobile-number-item">
                    <span className="mobile-number-value">{number}</span>
                    <div className="mobile-number-actions">
                      <button
                        type="button"
                        onClick={() =>
                          handleEditMobileNumber(
                            index,
                            formData,
                            setMobileNumberError,
                            setEditIndex,
                            setMobileNumberInput
                          )
                        }
                        className="edit-mobile-number-btn"
                        aria-label="Edit"
                        title="Edit"
                      >
                        {/* Edit Pencil in Square SVG */}
                        <svg
                          fill="#b06a11"
                          version="1.1"
                          id="Layer_1"
                          xmlns="http://www.w3.org/2000/svg"
                          xmlns:xlink="http://www.w3.org/1999/xlink"
                          width="25px"
                          height="25px"
                          viewBox="0 0 20 20"
                          enable-background="new 0 0 20 20"
                          xml:space="preserve"
                        >
                          <path d="M17,20H1c-0.6,0-1-0.4-1-1V3c0-0.6,0.4-1,1-1h9v2H2v14h14v-8h2v9C18,19.6,17.6,20,17,20z" />
                          <path d="M9.3,10.7c-0.4-0.4-0.4-1,0-1.4l9-9c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-9,9C10.3,11.1,9.7,11.1,9.3,10.7z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteMobileNumber(index, formData, setFormData)
                        }
                        className="delete-mobile-number-btn"
                        aria-label="Delete"
                        title="Delete"
                      >
                        {/* Trash Bin SVG */}
                        <svg
                          width="25px"
                          height="25px"
                          viewBox="0 0 1024 1024"
                          class="icon"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill="#b06a11"
                            d="M160 256H96a32 32 0 010-64h256V95.936a32 32 0 0132-32h256a32 32 0 0132 32V192h256a32 32 0 110 64h-64v672a32 32 0 01-32 32H192a32 32 0 01-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 01-32-32V416a32 32 0 0164 0v320a32 32 0 01-32 32zm192 0a32 32 0 01-32-32V416a32 32 0 0164 0v320a32 32 0 01-32 32z"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
