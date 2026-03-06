import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import API from "../../../api"; // Ensure API utility is correctly imported
import "./communitydetail.css";

const CommunityDetail = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get(`/detail/${id}`)
      .then((response) => {
        setCommunity(response.data);
        console.log("Community details:", response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching community details:", error);
        setError("Failed to load community details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading community details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!community) return <p>Community not found</p>;

  return (
    <div>
      <Navbar />
      <div className="community-detail-container">
        <div className="community-detail-card">
          <section>
            <h1>{community.community}</h1>
            <div className="info-section">
              <p>
                <strong>Location:</strong> {community.address}
              </p>
              <p>
                <strong>Group Name:</strong> {community.groupName}
              </p>
              <p>
                <strong>Quick Info:</strong> {community.quickInfo}
              </p>
              <p>{community.detail}</p>
            </div>

            <div className="media-section">
              <h3>Main Image</h3>
              <img
                src={community.mainImage}
                alt={community.community}
                className="main-image"
              />

              <h3>More Photos</h3>
              <div className="photos">
                {community.moreImages?.map((img, idx) => (
                  <img
                    src={img.image}
                    alt={`${community.community} photo ${idx + 1}`}
                    key={idx}
                  />
                ))}
              </div>

              <h3>Videos</h3>
              <div className="videos">
                {community.videos?.map((video, idx) => (
                  <video controls src={video.video} key={idx}>
                    Your browser does not support the video tag.
                  </video>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CommunityDetail;
