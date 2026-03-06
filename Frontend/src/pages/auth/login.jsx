import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash,FaRedo } from "react-icons/fa";
import { useUser } from "../../../contextapi"; // Adjust path
import "./auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser(); // Access login function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");
    setIsLoading(true);

    const loginData = { email, password };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}user/login/`,
        loginData,
        { withCredentials: true }
      );
      const userData = response.data; // Expecting { id, role, username, etc. } from backend
      login(userData); // Update context with user data
      navigate("/"); // Redirect to home or dashboard
    } catch (err) {
      setError("Email or password is incorrect, please try again");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-wrapper">
      <h2>Login</h2>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit}>
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
              "Login"
            )}
          </button>
        </div>
      </form>
      <p>
        Need an account? <Link to="/user/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
