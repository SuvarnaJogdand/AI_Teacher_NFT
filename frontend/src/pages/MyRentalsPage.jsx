import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

import { useWallet } from "../context/WalletContext";

import nftAbi from "../contracts/AITeacherNFT.json";
import rentalAbi from "../contracts/TeacherRental.json";

import {
  NFT_CONTRACT,
  RENTAL_CONTRACT
} from "../contracts/config";

function MyRentalsPage() {
  //const { signer, account } = useWallet();

 const {
  signer,
  walletAddress: account
} = useWallet();

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

      console.log("=================================");
      console.log("Loading My Rentals");
      console.log("Account:", account);
      console.log("NFT Contract:", NFT_CONTRACT);
      console.log("Rental Contract:", RENTAL_CONTRACT);

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

      // IMPORTANT:
      // Your NFT contract uses getTotalSupply()
      const totalSupplyBN =
        await nftContract.getTotalSupply();

      const totalSupply =
        Number(totalSupplyBN);

      console.log("Total NFT Supply:", totalSupply);

      const items = [];

      // Your token IDs appear to start from 1
      for (
        let tokenId = 1;
        tokenId <= totalSupply;
        tokenId++
      ) {
        try {
          console.log(
            `Checking rental for token ${tokenId}`
          );

          // Get rental expiry directly.
          // This avoids hasAccess() returning true
          // for NFT owners.
          const expiry =
            await rentalContract.getRentalExpiry(
              tokenId,
              account
            );

          const expiryNumber =
            Number(expiry);

          console.log(
            `Token ${tokenId} expiry:`,
            expiryNumber
          );

          // No rental / expired rental
          if (
            !expiryNumber ||
            expiryNumber <= Math.floor(Date.now() / 1000)
          ) {
            continue;
          }

          console.log(
            `Token ${tokenId} is actively rented by user`
          );

          const teacher =
            await nftContract.getTeacher(tokenId);

          console.log(
            `Teacher ${tokenId}:`,
            teacher
          );

          const expiryDate =
            new Date(expiryNumber * 1000);

          const remainingDays =
            Math.max(
              0,
              Math.ceil(
                (expiryDate.getTime() - Date.now()) /
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
          console.error(
            `Error checking token ${tokenId}:`,
            err
          );
        }
      }

      console.log(
        "Active rentals found:",
        items
      );

      setRentals(items);
    } catch (error) {
      console.error(
        "ERROR loading rentals:",
        error
      );

      setRentals([]);
    } finally {
      setLoading(false);
    }
  }

  if (!account) {
    return (
      <div className="page-container">
        <h2>Please connect your wallet</h2>
      </div>
    );
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
        <div>
          <p>No active rentals found.</p>
        </div>
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

              <h3>
                {item.teacher.name}
              </h3>

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