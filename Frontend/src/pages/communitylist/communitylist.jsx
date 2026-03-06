import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import API from "../../../api"; // Ensure you import API utility
import "./communitylist.css";
import { useUser } from "../../../contextapi";

const CommunityList = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userRole } = useUser(); // Assuming you have a user context

  useEffect(() => {
    API.get("/map")
      .then((response) => {
        setCommunities(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching communities:", error);
        setError("Failed to load communities.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="community-list-page">
      <Navbar />
      <button className="community-list-add-community-button">
        {userRole === "artist" ? (
          <Link to="/communityform">Add Community</Link>
        ) : (
          <span onClick={() => alert("Please login as artist")}>Add Community</span>
        )}
      </button>
      <header className="community-list-header">
        <h1>Communities</h1>
        <p>Explore the list of music communities in Rajasthan.</p>
      </header>

      {loading ? (
        <p className="community-list-loading-message">Loading communities...</p>
      ) : error ? (
        <p className="community-list-error-message">{error}</p>
      ) : (
        <section className="community-list-section">
          <ul className="community-list-ul">
            {communities.map((community) => (
              <li key={community.id} className="community-list-item">
                <Link to={`/community/${community.id}`} className="community-list-link">
                  {community.community}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default CommunityList;