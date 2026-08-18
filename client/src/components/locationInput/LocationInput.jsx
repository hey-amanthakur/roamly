import { useState } from "react";

const PRESET_LOCATIONS = [
  { name: "Paris, France", city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { name: "Tokyo, Japan", city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "New York, USA", city: "New York", country: "USA", lat: 40.7128, lng: -74.006 },
  { name: "London, UK", city: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { name: "Bali, Indonesia", city: "Bali", country: "Indonesia", lat: -8.3405, lng: 115.092 },
  { name: "Barcelona, Spain", city: "Barcelona", country: "Spain", lat: 41.3874, lng: 2.1686 },
  { name: "Sydney, Australia", city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Dubai, UAE", city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Rome, Italy", city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { name: "Bangkok, Thailand", city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
];

export default function LocationInput({ location, onChange }) {
  const [showPresets, setShowPresets] = useState(false);
  const [customName, setCustomName] = useState(location?.name || "");

  const handlePreset = (loc) => {
    onChange(loc);
    setCustomName(loc.name);
    setShowPresets(false);
  };

  const handleCustom = (e) => {
    setCustomName(e.target.value);
    onChange({
      name: e.target.value,
      city: "",
      country: "",
      lat: null,
      lng: null,
    });
  };

  return (
    <div className="locationInput">
      <label>Location</label>
      <div className="locationInputRow">
        <input
          type="text"
          placeholder="Where was this taken?"
          value={customName}
          onChange={handleCustom}
          onFocus={() => setShowPresets(true)}
          onBlur={() => setTimeout(() => setShowPresets(false), 200)}
        />
        <button
          type="button"
          className="presetBtn"
          onClick={() => setShowPresets(!showPresets)}
        >
          <i className="fas fa-map-marker-alt"></i>
        </button>
      </div>
      {showPresets && (
        <div className="presetDropdown">
          {PRESET_LOCATIONS.map((loc) => (
            <div
              key={loc.name}
              className="presetItem"
              onMouseDown={() => handlePreset(loc)}
            >
              <i className="fas fa-map-pin"></i>
              <span>{loc.name}</span>
            </div>
          ))}
        </div>
      )}
      {location?.name && (
        <div className="locationPreview">
          <i className="fas fa-check-circle"></i>
          <span>{location.name}</span>
        </div>
      )}
    </div>
  );
}
