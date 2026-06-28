import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

import abi from "../contracts/AITeacherNFT.json";
import { CONTRACT_ADDRESS } from "../contracts/config";
import { useWallet } from "../context/WalletContext";

function MySubscriptionPage() {
  const { walletAddress } = useWallet();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletAddress) {
      loadSubscriptions();
    } else {
      setLoading(false);
    }
  }, [walletAddress]);

  async function loadSubscriptions() {
    try {
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi.abi,
        provider
      );

      const tokenIds = await contract.getUserSubscriptions(walletAddress);

      const list = [];

      for (const tokenIdBN of tokenIds) {
        const tokenId = Number(tokenIdBN);

        const active = await contract.hasSubscription(
          tokenId,
          walletAddress
        );

        if (!active) continue;

        const [teacherInfo, teacherMarket, teacherStats] = await contract.getTeacher(tokenId);

        let image = "";

        try {
          const tokenURI = await contract.tokenURI(tokenId);

          const response = await fetch(tokenURI);
          const metadata = await response.json();

          image = metadata.image;
        } catch (err) {
          console.error("Metadata Error:", err);
        }

        const expiry = await contract.getSubscriptionExpiry(
          tokenId,
          walletAddress
        );

        const expiryDate = new Date(Number(expiry) * 1000);

        const remainingDays = Math.max(
          0,
          Math.ceil(
            (expiryDate.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
          )
        );

        list.push({
          tokenId,
          name: teacherInfo.name,
          subject: teacherInfo.subject,
          topic: teacherInfo.topic,
          specialization: teacherInfo.specialization,
          image,
          expiryDate,
          remainingDays,
        });
      }

      setSubscriptions(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!walletAddress) {
    return (
      <div className="page">
        <h2>Please connect your wallet.</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <h2>Loading subscriptions...</h2>
      </div>
    );
  }

  return (
    <div className="page">

      <h1>My Subscriptions</h1>

      {subscriptions.length === 0 ? (
        <h3>No Active Subscriptions</h3>
      ) : (
        <div className="teacher-grid">

          {subscriptions.map((teacher) => (

            <div
              key={teacher.tokenId}
              className="teacher-card"
            >

              {teacher.image && (
                <img
                  src={teacher.image}
                  alt={teacher.name}
                  className="teacher-image"
                />
              )}

              <h3>{teacher.name}</h3>

              <p>
                <strong>Subject:</strong> {teacher.subject}
              </p>

              <p>
                <strong>Topic:</strong> {teacher.topic}
              </p>

              <p>
                <strong>Specialization:</strong>{" "}
                {teacher.specialization}
              </p>

              <p>
                <strong>Expiry:</strong>{" "}
                {teacher.expiryDate.toLocaleDateString()}
              </p>

              <p>
                <strong>Remaining:</strong>{" "}
                {teacher.remainingDays} days
              </p>

              <p
                style={{
                  color: "green",
                  fontWeight: "bold",
                }}
              >
                Active
              </p>

              <Link to={`/teacher/${teacher.tokenId}`}>
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

export default MySubscriptionPage;