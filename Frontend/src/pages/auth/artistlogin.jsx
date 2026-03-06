import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMobileAlt, FaRedo } from "react-icons/fa";
import "./auth.css";

const ArtistLogin = () => {
  const [mobileNo, setMobileNo] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const mobileInputRef = useRef(null);

  // Auto-focus mobile input on mount
  useEffect(() => {
    if (mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || !mobileNo.trim()) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setError("");
    setIsLoading(true);

    const loginData = { mobileNo };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}artist/login/sendotp/`,
        loginData,
        { withCredentials: true }
      );
      navigate("/artist/enterotp", { state: { mobileNo: mobileNo } });
    } catch (err) {
      if(err.response) {
        console.error("Error response:", err.response);
        // Server responded with a status other than 2xx
        if (err.response.status === 400) {
          setError("Invalid mobile number format.");
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else if (err.response.status === 403) {
          setError("Mobile number not found!");
        }
        else {
          setError("An unexpected error occurred. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <h2>Artist Login</h2>
      <p className="auth-instruction">
        <FaMobileAlt className="auth-icon" /> Enter your mobile number to receive an OTP.
      </p>
      {error && <p className="auth-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="auth-password-container">
          <input
            type="tel" // Changed to "tel" for mobile numbers
            className="auth-input"
            placeholder="Enter mobile number (e.g., 9876543210)"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ""))} // Allow only digits
            ref={mobileInputRef}
            maxLength="10" // Assuming 10-digit mobile numbers
            required
          />
        </div>

        <div className="auth-button-container">
          <button
            type="submit"
            className={`auth-button ${isLoading ? "auth-button-loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>
                <FaRedo className="spin-icon" /> Sending...
              </span>
            ) : (
              "Send OTP"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArtistLogin;