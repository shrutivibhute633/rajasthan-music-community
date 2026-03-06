import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import { useUser } from "../../../contextapi"; // Adjust path
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import axios from "axios"; // Ensure axios is imported

const Navbar = () => {
  const { user, isAuthenticated, logout } = useUser(); // Use full context
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 700);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Logout handler with API call
  const logoutHandler = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BE_URL}logout/`,
        {},
        { withCredentials: true }
      );
      logout(); // Update context state
      navigate("/"); // Redirect to home page
    } catch (error) {
      console.error("Logout error:", error);
      // Optionally show an error message to the user
    }
  };

  const communityId = user?.communityId || user?.id; // Use site_id or user id as communityId

  const renderAuthSection = () => {
    if (!isAuthenticated || !user) {
      // User not logged in
      return (
        <div className="auth-buttons">
          <Link to="/user/login">
            <button className="btn btn-outline-custom-orange">Login</button>
          </Link>
          <Link to="/user/signup">
            <button className="btn btn-custom-orange">Signup</button>
          </Link>
        </div>
      );
    } else {
      // User logged in
      return (
        <div className="dropdown">
          <button
            className="btn btn-custom-orange dropdown-toggle"
            type="button"
            id="profileDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Profile
          </button>
          <ul className="dropdown-menu" aria-labelledby="profileDropdown">
            <li>
              <button className="dropdown-item" onClick={logoutHandler}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      );
    }
  };

  return (
    <div className="bd-example">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="navbar-content">
          <div className="navbar-left-group">
            {isMobile && (
              <div className="dropdown">
                <button
                  className="navbar-toggler"
                  type="button"
                  id="navbarDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <Link className="dropdown-item" to="/">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/about">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/community">
                      Community
                    </Link>
                  </li>
                  {user === null && (
                    <li>
                      <Link className="dropdown-item" to="/artistcorner">
                        Artist Corner
                      </Link>
                    </li>
                  )}
                  {user?.role === "artist" && communityId && (
                    <li>
                      <Link
                        className="dropdown-item"
                        to={`/communitypage/${communityId}`}
                      >
                        Your Community
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}
            <span className="navbar-brand">Manchitra</span>
            {!isMobile && (
              <ul className="navbar-nav mx-auto mt-2 mt-lg-0">
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/about">
                    About Us
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/community">
                    Community
                  </Link>
                </li>
                {user === null && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/artistcorner">
                      Artist Corner
                    </Link>
                  </li>
                )}
                {user?.role === "artist" && communityId && (
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to={`/communitypage/${communityId}`}
                    >
                      Your Community
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>
          {renderAuthSection()}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
