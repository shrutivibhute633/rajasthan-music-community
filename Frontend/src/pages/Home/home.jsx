import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { useNavigate } from "react-router-dom";
import API from "../../../api";
import "./home.css";
import { useUser } from "../../../contextapi";
import Navbar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
const Home = () => {
  const navigate = useNavigate();
  const [markers, setMarkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const { userRole } = useUser();

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await API.get("map");
        const transformedData = response.data.map((item) => ({
          id: item.id,
          position: [parseFloat(item.latitude), parseFloat(item.longitude)],
          name: item.groupName,
          community: item.community,
          location: item.address || "Unknown",
          instrument: "unknown",
        }));
        setMarkers(transformedData);
      } catch (error) {
        console.error("Error fetching markers:", error);
      }
    };
    fetchMarkers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const allValues = new Set();

    markers.forEach((marker) => {
      allValues.add(marker.name);
      allValues.add(marker.community);
      allValues.add(marker.location);
      allValues.add(marker.instrument);
    });

    const filtered = [...allValues].filter((item) =>
      item.toLowerCase().includes(query)
    );
    setSuggestions(filtered.slice(0, 5)); // limit to 5 suggestions
  }, [searchQuery, markers]);

  const filteredMarkers = markers.filter((marker) => {
    const query = searchQuery.toLowerCase();
    return (
      marker.name.toLowerCase().includes(query) ||
      marker.community.toLowerCase().includes(query) ||
      marker.location.toLowerCase().includes(query) ||
      marker.instrument.toLowerCase().includes(query)
    );
  });

  const customIcon = divIcon({
    className: "custom-marker",
    html: `<div style="
      background: red;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
      ">🎵</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

  const handleMarkerClick = (id) => {
    if (userRole === "none") {
      alert("Please log in as a Viewer or Artist to access community details.");
      return;
    }
    navigate(`/community/${id}`);
  };

  const handleSuggestionClick = (value) => {
    setSearchQuery(value);
    setSuggestions([]);
  };

  return (
    <div>
    <Navbar />
    <div className="map-page">
      <h1 className="map-title">Rajasthan Music Map</h1>

      <p className="map-description">  You can Explore the map of music communities in Rajasthan.
      </p>

      {/* 🔍 Search Section */}
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search by name, community, location, or instrument..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🗺️ Map Section */}
      <div className="map-wrapper">
        <MapContainer
          center={[26.5, 72.5]}
          zoom={7}
          style={{ height: "500px", width: "100%" }}
          minZoom={7}
          maxZoom={18}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          maxBounds={[
            [23.3, 69.3],
            [30.2, 78.2],
          ]}
          maxBoundsViscosity={1}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri"
          />

          <MarkerClusterGroup disableClusteringAtZoom={4}>
            {filteredMarkers.map((marker, index) => (
              <Marker
                key={index}
                position={marker.position}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(marker.id),
                }}
              >
                <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={false}>
                  <div>
                    <p><strong>Community:</strong> {marker.community}</p>
                    <p><strong>Location:</strong> {marker.location}</p>
                    <p><strong>Instruments:</strong> {marker.instrument}</p>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default Home;

