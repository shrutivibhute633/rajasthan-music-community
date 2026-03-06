import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../navbar/navbar';
import Footer from '../footer/footer';
import API from '../../../api'; // Ensure API utility is correctly imported
import './artists.css';

const Artist = () => {
  const { id, artistId } = useParams(); // Extract both community ID and artist ID from the URL
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the community details and extract the artist information
    API.get(`/detail/${id}`)
      .then((response) => {
        const communityData = response.data;
        const selectedArtist = communityData.artists.find(
          (artist) => artist.id === parseInt(artistId)
        );
        if (selectedArtist) {
          setArtist(selectedArtist);
        } else {
          setError('Artist not found');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching artist details:', error);
        setError('Failed to load artist details.');
        setLoading(false);
      });
  }, [id, artistId]);

  if (loading) return <p className="loading-message">Loading artist details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!artist) return <p className="not-found-message">Artist not found</p>;

  return (
    <div className="artist-detail-page">
      <Navbar />
      <section className="artist-detail">
        <div className="artist-header">
          <img
            src={artist.profilePicture}
            alt={artist.name}
            className="artist-profile-picture"
          />
          <div className="artist-info">
            <h1 className="artist-name">{artist.name}</h1>
            <p className="artist-instrument"><strong>Instrument:</strong> {artist.instrument}</p>
            <p className="artist-description">{artist.detail}</p>
          </div>
        </div>

        <div className="artist-media">
          <h3 className="media-heading">More Photos</h3>
          <div className="photos">
            {artist.artistMoreImages?.map((img, idx) => (
              <img
                src={img.image}
                alt={`${artist.name} photo ${idx + 1}`}
                key={idx}
                className="photo-item"
              />
            ))}
          </div>

          <h3 className="media-heading">Videos</h3>
          <div className="videos">
            {artist.artistVideos?.map((video, idx) => (
              <video controls src={video.video} key={idx} className="video-item">
                Your browser does not support the video tag.
              </video>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Artist;