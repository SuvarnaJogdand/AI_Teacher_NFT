import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

import { useWallet } from "../context/WalletContext";
import abi from "../contracts/AITeacherNFT.json";

import nftAbi from "../contracts/AITeacherNFT.json";
import rentalAbi from "../contracts/TeacherRental.json";

import {
  NFT_CONTRACT,
  RENTAL_CONTRACT
} from "../contracts/config";

function MyRentalsPage() {
  const { signer, account } = useWallet();

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (signer && account) {
      loadRentals();
    }
  }, [signer, account]);

  async function loadRentals() {
    try {
      setLoading(true);

      const nftContract = new ethers.Contract(
        NFT_CONTRACT,
        nftAbi.abi,
        signer
      );

      const rentalContract = new ethers.Contract(
        RENTAL_CONTRACT,
        rentalAbi.abi,
        signer
      );

      const totalSupply = await nftContract.totalSupply();

      const items = [];

      for (let tokenId = 1; tokenId <= Number(totalSupply); tokenId++) {
        try {
          const hasAccess =
            await rentalContract.hasAccess(
              tokenId,
              account
            );

          if (!hasAccess) continue;

          const expiry =
            await rentalContract.getRentalExpiry(
              tokenId,
              account
            );

          const teacher =
            await nftContract.getTeacher(tokenId);

          const expiryDate =
            new Date(Number(expiry) * 1000);

          const remainingDays =
            Math.max(
              0,
              Math.ceil(
                (expiryDate - new Date()) /
                (1000 * 60 * 60 * 24)
              )
            );

          items.push({
            tokenId,
            teacher,
            expiryDate,
            remainingDays
          });
        } catch (err) {
          console.log(err);
        }
      }

      setRentals(items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <h2>Loading Rentals...</h2>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>My Rentals</h1>

      {rentals.length === 0 ? (
        <p>No active rentals found.</p>
      ) : (
        <div className="teacher-grid">
          {rentals.map((item) => (
            <div
              key={item.tokenId}
              className="teacher-card"
            >
              {item.teacher.imageUrl && (
                <img
                  src={item.teacher.imageUrl}
                  alt={item.teacher.name}
                />
              )}

              <h3>{item.teacher.name}</h3>

              <p>
                <strong>Subject:</strong>{" "}
                {item.teacher.subject}
              </p>

              <p>
                <strong>Topic:</strong>{" "}
                {item.teacher.topic}
              </p>

              <p>
                <strong>Expiry:</strong>{" "}
                {item.expiryDate.toLocaleString()}
              </p>

              <p>
                <strong>Remaining:</strong>{" "}
                {item.remainingDays} days
              </p>

              <p
                style={{
                  color: "green",
                  fontWeight: "bold"
                }}
              >
                Active Rental
              </p>

              <Link
                to={`/teacher/${item.tokenId}`}
              >
                <button>
                  View Teacher
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRentalsPage;