import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./formadress.css";

// Fix Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng, trigger: "map" });
    },
  });
  return null;
}

export default function AddressLocationPage({ formData, handleInputChange }) {
  const [location, setLocation] = useState({
    lat: formData.latitude ? parseFloat(formData.latitude) : null,
    lng: formData.longitude ? parseFloat(formData.longitude) : null,
    trigger: null, // "map", "current", or "search"
  });
  const [mapCenter, setMapCenter] = useState([26.5, 72.5]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapRef = useRef();

  // On mount, center map at user's location (but don't set address)
  useEffect(() => {
    if (!location.lat || !location.lng) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setMapCenter([lat, lng]);
          },
          () => {
            // Use default center
          }
        );
      }
    } else {
      setMapCenter([location.lat, location.lng]);
    }
    // eslint-disable-next-line
  }, []);

  // Only reverse geocode and update formData when user acts
  useEffect(() => {
    if (location.lat && location.lng && location.trigger) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lng}`
      )
        .then((res) => res.json())
        .then((data) => {
          const addr = data.display_name || "";
          handleInputChange({
            target: { name: "address", value: addr },
          });
          handleInputChange({
            target: { name: "latitude", value: location.lat.toString() },
          });
          handleInputChange({
            target: { name: "longitude", value: location.lng.toString() },
          });
        });
    }
    // eslint-disable-next-line
  }, [location]);

  // Fetch suggestions as user types (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            searchQuery
          )}&addressdetails=1&limit=5`
        )
          .then((res) => res.json())
          .then((data) => setSuggestions(data));
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Handler for choosing a suggestion
  const handleSuggestionClick = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setLocation({ lat, lng, trigger: "search" });
    setMapCenter([lat, lng]);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handler for "Choose current location"
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng, trigger: "current" });
          setMapCenter([lat, lng]);
          setSearchQuery(""); // clear search bar
          setSuggestions([]);
          setShowSuggestions(false);
        },
        () => {
          alert("Unable to fetch current location.");
        }
      );
    }
  };

  // When marker is moved by map click
  useEffect(() => {
    if (location.trigger === "map") {
      setMapCenter([location.lat, location.lng]);
    }
  }, [location]);

  return (
    <div className="address-step-container">
      <h2 className="address-title">Select your community location on map</h2>
      <div className="address-searchbar-wrapper">
        <input
          type="text"
          className="address-searchbar"
          placeholder="Search for a location"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="address-search-suggestions">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onClick={() => handleSuggestionClick(s)}
                className="address-search-suggestion"
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="address-actions">
        <button
          className="choose-location-btn"
          type="button"
          onClick={handleCurrentLocation}
        >
          <span className="choose-location-icon" aria-label="location">
            {/* Location Target SVG */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "inline-block", verticalAlign: "middle" }}
            >
              <circle
                cx="11"
                cy="11"
                r="4"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <circle
                cx="11"
                cy="11"
                r="9"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              <line
                x1="11"
                y1="1"
                x2="11"
                y2="4"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <line
                x1="11"
                y1="18"
                x2="11"
                y2="21"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <line
                x1="1"
                y1="11"
                x2="4"
                y2="11"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <line
                x1="18"
                y1="11"
                x2="21"
                y2="11"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          Choose current location
        </button>
      </div>
      <div className="leaflet-map-wrapper">
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="leaflet-map-box"
          style={{
            height: "400px",
            width: "90vw",
            maxWidth: "900px",
            background: "#ddd",
          }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri"
          />
          {location.lat && location.lng && (
            <Marker position={[location.lat, location.lng]} />
          )}
          <LocationMarker setLocation={setLocation} />
        </MapContainer>
      </div>
    </div>
  );
}
