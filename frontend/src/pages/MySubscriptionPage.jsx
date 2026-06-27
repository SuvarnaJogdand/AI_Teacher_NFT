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
    }
  }, [walletAddress]);

  async function loadSubscriptions() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        provider
      );

      const total = Number(await contract.getTotalSupply());

      let activeSubscriptions = [];

      for (let i = 1; i <= total; i++) {
        const active = await contract.hasSubscription(
          i,
          walletAddress
        );

        if (active) {
          const teacher = await contract.getTeacher(i);

          let image = "";

          try {
            const uri = await contract.tokenURI(i);
            const metadata = await fetch(uri).then((res) => res.json());

            image = metadata.image;
          } catch (err) {
            console.log(err);
          }

          activeSubscriptions.push({
            tokenId: i,
            name: teacher.name,
            subject: teacher.subject,
            topic: teacher.topic,
            specialization: teacher.specialization,
            image,
          });
        }
      }

      setSubscriptions(activeSubscriptions);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="page">

      <h1>My Subscriptions</h1>

      {subscriptions.length === 0 ? (
        <h3>No Active Subscription</h3>
      ) : (
        <div className="teacher-grid">

          {subscriptions.map((teacher) => (
            <div
              key={teacher.tokenId}
              className="teacher-card"
            >
              <img
                src={teacher.image}
                alt={teacher.name}
                className="teacher-image"
              />

              <h3>{teacher.name}</h3>

              <p>
                <b>Subject:</b> {teacher.subject}
              </p>

              <p>
                <b>Topic:</b> {teacher.topic}
              </p>

              <p>
                <b>Specialization:</b>{" "}
                {teacher.specialization}
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