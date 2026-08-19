import { useState } from "react";
import { PRESET_LOCATIONS } from "../../constants";

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
