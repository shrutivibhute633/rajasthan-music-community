import React from "react";
import { Link } from "react-router-dom";
import "./artistcorner.css"; // Optional CSS file for additional styling
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/navbar/navbar";
const ArtistCorner = () => {
  return (
    <div>
      <Navbar />
    <div className="artist-corner-container">
      <h1>Artist Corner</h1>
      <div className="button-group">
        <Link to="/artist/login">
          <button className="btn btn-custom-orange">Artist Login</button>
        </Link>
        <Link to="/communityform">
          <button className="btn btn-custom-orange">Add Community</button>
        </Link>
      </div>
    </div>
    </div>
  );
};

export default ArtistCorner;