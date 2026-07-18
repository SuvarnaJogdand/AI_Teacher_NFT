import { useState } from "react";
import CountryPopup from "./CountryPopup";
import { Link } from "react-router-dom";


function TeacherCard({ teacher }) {

  console.log("teacher.id:", teacher.id);
  console.log("teacher.tokenId:", teacher.tokenId);

  console.log("Teacher:", teacher);

  const [showCountryPopup, setShowCountryPopup] =
    useState(false);

  const handleSubscribe = () => {

    const country =
      localStorage.getItem("country");

    if (!country) {
      setShowCountryPopup(true);
      return;
    }

    window.location.href =
      `/subscription/${teacher.tokenId}`;
  }

  return (
    <div className="teacher-card">

      {teacher.imageUrl ? (
        <img
          src={teacher.imageUrl}
          alt={teacher.name}
          className="teacher-image"
        />
      ) : (
        <div className="teacher-image-placeholder">
          🎓
        </div>
      )}

      <h3>{teacher.name}</h3>

      <p>
        <strong>Subject:</strong>{" "}
        {teacher.subject}
      </p>

      {teacher.level && (
        <p>
          <strong>Level:</strong>{" "}
          {teacher.level}
        </p>
      )}

      {teacher.experience !== undefined && (
        <p>
          <strong>XP:</strong>{" "}
          {teacher.experience}
        </p>
      )}


      <p>
        {teacher.forSale
          ? `🟢 For Sale (${teacher.salePrice} POL)`
          : "🔴 Not For Sale"}
      </p>

      <p>
        {teacher.forRent
          ? `🟢 For Rent (${teacher.rentPricePerDay} POL/day)`
          : "🔴 Not For Rent"}
      </p>

      <div
        style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center",
          marginTop: "10px",
        }}
      >
        <Link
          className="details-btn"
          to={`/teacher/${teacher.id}`}
        >
          View Details
        </Link>

        <button onClick={handleSubscribe}>
          Subscribe
        </button>
      </div>

      {
        showCountryPopup && (
          <CountryPopup
            onSave={(selectedCountry) => {

              localStorage.setItem(
                "country",
                selectedCountry
              );

              setShowCountryPopup(false);

              window.location.href =
                `/subscription/${teacher.tokenId}`;
            }}
          />
        )
      }





    </div>
  );
}

export default TeacherCard;

