import { useState } from "react";
import { PRESET_LOCATIONS } from "../../constants";
import { Location, LocationInputProps } from "../../types";

export default function LocationInput({ location, onChange }: LocationInputProps) {
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>(location?.name || "");

  const handlePreset = (loc: Location): void => {
    onChange(loc);
    setCustomName(loc.name);
    setShowPresets(false);
  };

  const handleCustom = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setCustomName(val);
    onChange({
      name: val,
      city: "",
      country: "",
      lat: null,
      lng: null,
    });
  };

  const filteredPresets = PRESET_LOCATIONS.filter((loc: Location) =>
    customName.length > 0 && loc.name.toLowerCase().includes(customName.toLowerCase())
  );

  return (
    <div className="locationInput">
      <label>Location</label>
      <div className="locationInputRow">
        <input
          type="text"
          placeholder="Where was this taken?"
          value={customName}
          onChange={handleCustom}
          onFocus={() => {
            if (customName.length > 0) setShowPresets(true);
          }}
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
      {showPresets && filteredPresets.length > 0 && (
        <div className="presetDropdown">
          {filteredPresets.map((loc: Location) => (
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
