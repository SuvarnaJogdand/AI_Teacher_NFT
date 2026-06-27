
import { Link } from "react-router-dom";


function TeacherCard({ teacher }) {

  console.log("teacher.id:", teacher.id);
  console.log("teacher.tokenId:", teacher.tokenId);
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

      {/* {teacher.forSale && (
        <p>
          <strong>For Sale:</strong> 🟢 Yes
          <br />
          <strong>Sale Price:</strong> {teacher.price} POL
        </p>
      )}

      {teacher.forRent && (
        <p>
          <strong>For Rent:</strong> 🟢 Yes
          <br />
          <strong>Rent Price:</strong> {teacher.rentPricePerDay} POL/day
        </p>
      )} */}

      <p>
        <strong>Sale Status:</strong>{" "}
        {teacher.forSale
          ? `🟢 For Sale (${teacher.price} POL)`
          : "🔴 Not For Sale"}
      </p>

      <p>
        <strong>Rent Status:</strong>{" "}
        {teacher.forRent
          ? `🟢 For Rent (${teacher.rentPricePerDay} POL/day)`
          : "🔴 Not For Rent"}
      </p>

      {/* <Link
        className="details-btn"
        to={`/teacher/${teacher.id}`}
      >
        View Details
      </Link>

      <Link to={`/subscribe/${teacher.id}`}>
        <button>Subscribe</button>
      </Link> */}

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

        <Link to={`/subscribe/${teacher.id}`}>
          <button>Subscribe</button>
        </Link>
      </div>





    </div>
  );
}

export default TeacherCard;

