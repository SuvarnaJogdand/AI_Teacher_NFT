import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../context/WalletContext";
import abi from "../contracts/AITeacherNFT.json";
import { NFT_CONTRACT } from "../contracts/config";
import { getMarketplaceContract, getRentalContract, getSubscriptionContract } from "../contracts/contracts";

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
        NFT_CONTRACT,
        abi.abi,
        signer
      );

      const teacherData =
        await contract.getTeacher(id);

      await loadSubscriptionPrices(Number(id));

      const owner =
        await contract.teacherOwner(id);

      const skills =
        await contract.getSkills(id);

      const walletAddress =
        await signer.getAddress();

      setAccount(walletAddress);

      const marketplace =
        await getMarketplaceContract();

      const listing =
        await marketplace.getListing(Number(id));;

      console.log("Listing:", listing);
      console.log("Listing Active:", listing.active);
      console.log("Listing Price:", listing.price?.toString());

      console.log("Teacher Data:", teacherData);
console.log("Experience:", teacherData.experience);

      const rental =
        await getRentalContract();

      const rentalInfo =
        await rental.getRental(id);

      console.log(
        "Rental Active:",
        rentalInfo.active
      );

      console.log("Rental Info:", rentalInfo);
      console.log("Listing:", listing);

      console.log(
        rentalInfo?.rentPricePerDay?.toString?.()
      );

      setTeacher({
        tokenId: Number(id),

        name: teacherData.name,
        subject: teacherData.subject,
        topic: teacherData.topic,
        specialization: teacherData.specialization,
        experience: teacherData.experience,
        price: ethers.formatEther(
          teacherData.mintPrice
        ),

        owner,
        skills,

        forSale: listing.active,

        salePrice: listing.price
          ? ethers.formatEther(listing.price)
          : "0",

        forRent: Boolean(rentalInfo[1]),

        rentPricePerDay:
          rentalInfo[0]
            ? ethers.formatEther(rentalInfo[0])
            : "0",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionPrices = async (tokenId) => {
    try {
      const subscriptionContract =
        await getSubscriptionContract();

      const plan =
        await subscriptionContract.getPlan(tokenId);

      setMonthlyPrice(
        ethers.formatEther(plan.monthlyPrice)
      );

      setYearlyPrice(
        ethers.formatEther(plan.yearlyPrice)
      );

    } catch (err) {
      console.error(err);
    }
  };


  const checkSubscription = async () => {
    try {
      if (!signer) return;

      const subscriptionContract =
        await getSubscriptionContract();



      const walletAddress =
        await signer.getAddress();

      const active =
        await subscriptionContract.hasSubscription(
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
      if (!salePrice || Number(salePrice) <= 0) {
        alert("Please enter a valid sale price");
        return;
      }

      const marketplace =
        await getMarketplaceContract();

      const tx =
        await marketplace.listNFT(
          teacher.tokenId,
          ethers.parseEther(salePrice)
        );

      console.log("Listing TX:", tx.hash);

      const receipt = await tx.wait();

      console.log("Receipt:", receipt);

      await tx.wait();

      alert("NFT listed for sale");

      loadTeacher();
    } catch (err) {
      console.error(err);
    }
  };

  const listForRent = async () => {
    try {
      if (!rentPrice || Number(rentPrice) <= 0) {
        alert("Enter rent price");
        return;
      }

      const rental =
        await getRentalContract();

      const tx =
        await rental.listForRent(
          teacher.tokenId,
          ethers.parseEther(
            rentPrice.toString()
          )
        );

      await tx.wait();

      alert("Listed for rent");

      loadTeacher();

    } catch (err) {
      console.error(err);
    }
  };

  const setSubscriptionPrice = async () => {
    try {
      if (!monthlyPrice || !yearlyPrice) {
        alert("Enter both monthly and yearly prices");
        return;
      }

      const subscriptionContract =
        await getSubscriptionContract();

      const tx =
        await subscriptionContract.setSubscriptionPrice(
          teacher.tokenId,
          ethers.parseEther(monthlyPrice.toString()),
          ethers.parseEther(yearlyPrice.toString())
        );

      await tx.wait();

      alert("Subscription prices updated");

      loadSubscriptionPrices(teacher.tokenId);

    } catch (err) {
      console.error(err);
    }
  };

  const cancelSale = async () => {
    try {
      const marketplace =
        await getMarketplaceContract();

      const tx =
        await marketplace.cancelListing(
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
      const marketplace =
        await getMarketplaceContract();

      const listing =
        await marketplace.getListing(
          teacher.tokenId
        );

      const tx =
        await marketplace.buyNFT(
          teacher.tokenId,
          {
            value: listing.price
          }
        );

      await tx.wait();

      alert("NFT purchased successfully");

      loadTeacher();
    } catch (err) {
      console.error(err);
    }
  };

  const rentNFT = async () => {
    try {

      const rental =
        await getRentalContract();

      const totalRent =
        Number(
          teacher.rentPricePerDay
        ) * daysCount;



      const tx =
        await rental.rentTeacher(
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

      alert("NFT rented successfully");

      loadTeacher();

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
          to="/"
          className="details-btn"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  console.log("Teacher Owner:", teacher?.owner);
  console.log("Connected Account:", account);

  console.log(
    "Owner Match:",
    teacher?.owner?.toLowerCase() ===
    account?.toLowerCase()
  );



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

        <h3>NFT Price</h3>
        <p>{teacher.price} POL</p>

        <h3>Subscription Prices</h3>

        <p>
          Monthly: {monthlyPrice} POL
        </p>

        <p>
          Yearly: {yearlyPrice} POL
        </p>

        <h3>Status</h3>

        {/* <p>
          Sale:
          {teacher.forSale
            ? " For Sale"
            : " Not For Sale"}
        </p> */}

        <p>
          Sale Status:
          {teacher.forSale
            ? `🟢 For Sale (${teacher.salePrice} POL)`
            : "🔴 Not For Sale"}
        </p>

        <p>
          Rent Status:
          {teacher.forRent
            ? `🟢 For Rent (${teacher.rentPricePerDay} POL/day)`
            : "🔴 Not For Rent"}
        </p>

        <p>
          Subscription:
          {subscriptionActive
            ? " Active"
            : " Not Active"}
        </p>


        <h3>Skills</h3>

        {!teacher.skills || teacher.skills.length === 0 ? (
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

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {teacher.owner?.toLowerCase() === account?.toLowerCase() && (
            <>

              <br />
              <br />
            </>
          )}

        </div>

        <br />
        <br />

        <div className="button-group">
          {teacher.owner?.toLowerCase() === account?.toLowerCase() && (

            <>

              <input
                type="number"
                placeholder="Sale Price (POL)"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
              <button onClick={listForSale}>
                List For Sale
              </button>

              <input
                type="number"
                placeholder="Rent Price Per Day (POL)"
                value={rentPrice}
                onChange={(e) =>
                  setRentPrice(e.target.value)
                }
              />

              <button onClick={listForRent}>
                List For Rent
              </button>

              <button onClick={cancelSale}>
                Cancel Sale
              </button>
            </>
          )}
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
          to="/"
          className="details-btn"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default TeacherDetails;