import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaRedo } from "react-icons/fa";
import { useUser } from "../../../contextapi"; // Adjust path
import "./auth.css";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useUser(); // Access signup function from context

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "India",
    "Germany",
    "France",
    "Brazil",
    "Japan",
    "South Africa",
    "Mexico",
    "China",
    "Russia",
    "Italy",
    "Spain",
  ];

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(countryQuery.toLowerCase())
  );

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    if (!password) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const signupData = {
      first_name: firstName,
      last_name: lastName,
      country,
      email,
      password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}user/signup/`,
        signupData,
        { withCredentials: true }
      );
      const userData = response.data; // Expecting { id, role, username, etc. } from backend
      signup(userData); // Update context with user data
      navigate("/"); // Redirect to home or dashboard
    } catch (err) {
      const errorMessage =
        err.response?.data?.email?.[0] ||
        err.response?.data?.message ||
        err.response?.data?.password?.[0] ||
        "Signup failed";
      if (errorMessage.includes("custom user with this email already exists")) {
        setError("This email is already registered");
      } else if (errorMessage.includes("password is too common")) {
        setError("Password is too common");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (selectedCountry) => {
    setCountry(selectedCountry);
    setCountryQuery(selectedCountry);
    setIsDropdownOpen(false);
  };

  const handleCountryInputChange = (e) => {
    setCountryQuery(e.target.value);
    setIsDropdownOpen(true);
    setCountry(e.target.value);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="auth-wrapper">
      <h2>Sign Up</h2>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="auth-input"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          className="auth-input"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <div className="auth-country-selector">
          <input
            type="text"
            className="auth-input"
            placeholder="Country"
            value={countryQuery}
            onChange={handleCountryInputChange}
            onFocus={() => setIsDropdownOpen(true)}
            required
          />
          {isDropdownOpen && countryQuery && filteredCountries.length > 0 && (
            <ul className="auth-country-dropdown">
              {filteredCountries.map((c) => (
                <li
                  key={c}
                  onClick={() => handleCountrySelect(c)}
                  className="auth-country-option"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="email"
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="auth-password-container">
          <input
            type={showPassword ? "text" : "password"}
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="auth-eye-icon" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div className="auth-password-container">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="auth-input"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span
            className="auth-eye-icon"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div className="auth-button-container">
          <button
            type="submit"
            className={`auth-button ${isLoading ? "auth-button-loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>
                <FaRedo className="spin-icon" /> 
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </div>
      </form>
      <p>
        Already have an account? <Link to="/user/login">Login</Link>
      </p>
    </div>
  );
};

export default Signup;