import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../context/WalletContext";
import abi from "../contracts/AITeacherNFT.json";
import { CONTRACT_ADDRESS } from "../contracts/config";

function TeacherDetails() {
  const { id } = useParams();

  const { signer } = useWallet();

  const [teacher, setTeacher] = useState(null);
  const [salePrice, setSalePrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [rentPrice, setRentPrice] = useState("");
  const [daysCount, setDaysCount] = useState(30);
  const [hasAccess, setHasAccess] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [yearlyPrice, setYearlyPrice] = useState("");

  useEffect(() => {
    loadTeacher();
    checkSubscription();
  }, [id, signer]);

  const loadTeacher = async () => {
    try {
      if (!signer) return;

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi.abi,
        signer
      );

      const [info, market, stats] =
        await contract.getTeacher(id);

      console.log("Market Data:");
      console.log("Price:", market.price);
      console.log("For Sale:", market.forSale);
      console.log("Rent Price:", market.rentPricePerDay);
      console.log("For Rent:", market.forRent);

      console.log("Info:", info);
      console.log("Market:", market);
      console.log("Stats:", stats);

      const owner =
        await contract.teacherOwner(id);
      console.log("Owner:", owner);

      const skills =
        await contract.getSkills(id);

      const walletAddress =
        await signer.getAddress();

      setAccount(walletAddress);

      setTeacher({
        tokenId: Number(id),

        name: info.name,
        subject: info.subject,
        topic: info.topic,
        specialization: info.specialization,

        experience: Number(stats.experience),
        level: Number(stats.level),

        price: ethers.formatEther(
          market.price
        ),

        rawPrice: market.price,



        forSale: market.forSale,
        forRent: market.forRent,
        rentPricePerDay: ethers.formatEther(
          market.rentPricePerDay
        ),


        owner,
        skills,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      if (!signer) return;

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi.abi,
        signer
      );

      const walletAddress =
        await signer.getAddress();

      const active =
        await contract.hasSubscription(
          id,
          walletAddress
        );

      setSubscriptionActive(active);

    } catch (err) {
      console.error(err);
    }
  };





  const listForSale = async () => {
    try {

      console.log(
        "Teacher Owner:",
        teacher?.owner
      );

      console.log(
        "Token ID:",
        teacher?.tokenId
      );

      console.log(
        "Connected Wallet:",
        await signer.getAddress()
      );

      console.log(
        "Token ID:",
        teacher.tokenId
      );

      console.log(
        "Sale Price:",
        salePrice
      );

      const contract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          abi.abi,
          signer
        );

      const tx =
        await contract.listForSale(
          teacher.tokenId,
          ethers.parseEther(
            salePrice
          )
        );

      await tx.wait();

      alert(
        "NFT listed successfully"
      );

      loadTeacher();

    } catch (err) {


      console.error(
        "Teacher Load Error:",
        err
      );

      console.error(
        "FULL ERROR:",
        err
      );

      console.log(
        "REASON:",
        err.reason
      );

      console.log(
        "SHORT MESSAGE:",
        err.shortMessage
      );

      console.log(
        "MESSAGE:",
        err.message
      );
    }
  };

  const listForRent = async () => {
    try {

      console.log("Button clicked");
      console.log("Signer:", signer);
      console.log("TokenId:", teacher.tokenId);
      console.log("Rent Price:", rentPrice);

      const contract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          abi.abi,
          signer
        );

      console.log(
        abi.abi.find(
          item => item.name === "listForRent"
        )
      );

      console.log(
        contract.listForRent
      );

      const tx =
        await contract.listForRent(
          teacher.tokenId,
          ethers.parseEther(rentPrice)
        );

      console.log("Transaction sent");

      await tx.wait();

      alert("Listed for rent");

      loadTeacher();

    } catch (err) {
      console.error("FULL ERROR:", err);
      console.log("Reason:", err.reason);
      console.log("Short Message:", err.shortMessage);
    }
  };

  const setSubscriptionPrice = async () => {
    try {

      const contract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          abi.abi,
          signer
        );

      const tx =
        await contract.setSubscriptionPrice(
          teacher.tokenId,
          ethers.parseEther(monthlyPrice),
          ethers.parseEther(yearlyPrice)
        );

      await tx.wait();

      // Verify saved values
      const monthly =
        await contract.monthlySubscriptionPrice(
          teacher.tokenId
        );

      const yearly =
        await contract.yearlySubscriptionPrice(
          teacher.tokenId
        );

      console.log(
        "Saved Monthly:",
        ethers.formatEther(monthly)
      );

      console.log(
        "Saved Yearly:",
        ethers.formatEther(yearly)
      );

      alert(
        "Subscription prices updated"
      );

    } catch (err) {
      console.error(err);
    }
  };

  const cancelSale = async () => {
    try {
      const contract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          abi.abi,
          signer
        );

      const tx =
        await contract.cancelSale(
          teacher.tokenId
        );

      await tx.wait();

      loadTeacher();
    } catch (err) {
      console.error(err);
    }
  };

  const buyNFT = async () => {
    try {
      const contract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          abi.abi,
          signer
        );

      const tx =
        await contract.buyNFT(
          teacher.tokenId,
          {
            value:
              teacher.rawPrice,
          }
        );

      await tx.wait();

      loadTeacher();
    } catch (err) {
      console.error(err);
    }
  };

  const rentNFT = async () => {
    try {

      const contract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          abi.abi,
          signer
        );

      const totalRent =
        Number(
          teacher.rentPricePerDay
        ) * daysCount;

      const tx =
        await contract.rentTeacher(
          teacher.tokenId,
          daysCount,
          {
            value:
              ethers.parseEther(
                totalRent.toString()
              )
          }
        );

      await tx.wait();

      alert("NFT rented");

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Loading Teacher...</h2>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="container">
        <h2>Teacher Not Found</h2>

        <Link
          to="/my-nfts"
          className="details-btn"
        >
          Back to My NFTs
        </Link>
      </div>
    );
  }

  console.log("forSale:", teacher?.forSale);
  console.log("owner:", teacher?.owner);
  console.log("account:", account);

  return (
    <div className="container">
      <div className="metadata-card">
        <h1>{teacher.name}</h1>

        <h3>Token ID</h3>
        <p>{teacher.tokenId}</p>

        <h3>Specialization</h3>
        <p>{teacher.specialization}</p>

        <h3>Level</h3>
        <p>{teacher.level}</p>

        <h3>Experience</h3>
        <p>{teacher.experience}</p>

        <h3>Owner Wallet</h3>
        <p>{teacher.owner}</p>

        <h3>Price</h3>
        <p>{teacher.price} POL</p>

        <h3>Status</h3>

        <p>
          Sale:
          {teacher.forSale
            ? " For Sale"
            : " Not For Sale"}
        </p>

        <p>
          Rent:
          {teacher.forRent
            ? " For Rent"
            : " Not For Rent"}
        </p>

        <p>
          Rent Price:
          {teacher.rentPricePerDay}
          POL/day
        </p>

        <p>
          Subscription:
          {subscriptionActive
            ? " Active"
            : " Not Active"}
        </p>

        <p>
          Subscription:
          {subscriptionActive
            ? " Active"
            : " Not Active"}
        </p>

        <h3>Skills</h3>

        {teacher.skills.length === 0 ? (
          <p>No skills added yet</p>
        ) : (
          <ul>
            {teacher.skills.map(
              (skill, index) => (
                <li key={index}>
                  {skill}
                </li>
              )
            )}
          </ul>
        )}

        <br />

        <hr />

        <h3>Marketplace</h3>

        <div className="input-group">
          <input
            type="number"
            step="0.01"
            placeholder="Enter price in POL"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />

          <input
            type="number"
            step="0.01"
            placeholder="Rent price/day"
            value={rentPrice}
            onChange={(e) => setRentPrice(e.target.value)}
          />

          <input
            type="number"
            step="0.01"
            placeholder="Monthly Price (POL)"
            value={monthlyPrice}
            onChange={(e) => setMonthlyPrice(e.target.value)}
          />

          <input
            type="number"
            step="0.01"
            placeholder="Yearly Price (POL)"
            value={yearlyPrice}
            onChange={(e) => setYearlyPrice(e.target.value)}
          />
        </div>

        {/* {teacher.owner?.toLowerCase() === account?.toLowerCase() && (
          <>
            <button onClick={setSubscriptionPrice}>
              Set Subscription Price
            </button>
            <br />
            <br />
          </>
        )} */}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {teacher.owner?.toLowerCase() === account?.toLowerCase() && (
            <>
              <button onClick={setSubscriptionPrice}>
                Set Subscription Price
              </button>
              <br />
              <br />
            </>
          )}

        </div>

        <br />
        <br />

        <div className="button-group">
          <button onClick={listForSale}>
            List For Sale
          </button>

          <button onClick={listForRent}>
            List For Rent
          </button>

          <button onClick={cancelSale}>
            Cancel Sale
          </button>
        </div>

        <div className="button-group"></div>
        {
          teacher.forSale &&
          account &&
          teacher.owner &&
          teacher.owner.toLowerCase() !== account.toLowerCase() && (
            <button onClick={buyNFT}>
              Buy NFT
            </button>
          )
        }
         

        {
          teacher.forRent &&
          teacher.owner?.toLowerCase() !==
          account?.toLowerCase() && (

            <>
              <input
                type="number"
                value={daysCount}
                onChange={(e) =>
                  setDaysCount(
                    Number(e.target.value)
                  )
                }
              />

              <button
                onClick={rentNFT}
              >
                Rent NFT
              </button>



            </>


          )
        }

        {
          !subscriptionActive &&
          teacher.owner?.toLowerCase() !==
          account?.toLowerCase() && (
            <Link
              to={`/subscription/${teacher.tokenId}`}
            >
              <button>
                Subscribe
              </button>
            </Link>
          )
        }



        <Link
          to="/my-nfts"
          className="details-btn"
        >
          ← Back to My NFTs
        </Link>
      </div>
    </div>
  );
}

export default TeacherDetails;