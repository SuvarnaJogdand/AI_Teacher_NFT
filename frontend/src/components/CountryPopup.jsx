import { useState } from "react";

function CountryPopup({ onSave }) {
  const [country, setCountry] = useState("India");

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>Select Your Country</h3>

        <select
          value={country}
          onChange={(e) =>
            setCountry(e.target.value)
          }
        >
          <option>India</option>
          <option>USA</option>
          <option>UK</option>
          <option>Canada</option>
          <option>Japan</option>
        </select>

        <br />
        <br />

        <button
          onClick={() => onSave(country)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default CountryPopup;