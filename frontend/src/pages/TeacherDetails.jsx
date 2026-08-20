import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../context/WalletContext";
import abi from "../contracts/AITeacherNFT.json";
import { NFT_CONTRACT } from "../contracts/config";
import { getMarketplaceContract, getRentalContract, getSubscriptionContract } from "../contracts/contracts";

function TeacherDetails() {
  //const {tokenId } = useParams();

  const params = useParams();

  const tokenId =
    params.tokenId ||
    params.id;

  console.log("TeacherDetails params:", params);
  console.log("TeacherDetails tokenId:", tokenId);

  const numericTokenId = Number(tokenId);

  if (!tokenId || Number.isNaN(numericTokenId)) {
    console.error("Invalid tokenId:", tokenId);
    return null;
  }

  const { signer } = useWallet();


  const [teacher, setTeacher] = useState(null);
  console.log("RENDER TEACHER:", teacher);
  const [salePrice, setSalePrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [rentPrice, setRentPrice] = useState("");
  const [daysCount, setDaysCount] = useState(30);
  const [rentalExpiry, setRentalExpiry] = useState(0);
  const [hasRentalAccess, setHasRentalAccess] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [yearlyPrice, setYearlyPrice] = useState("");
  const [ratingInfo, setRatingInfo] = useState({ average: 0, count: 0 });
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("5");



  useEffect(() => {
    loadTeacher();
    checkSubscription();

  }, [tokenId, signer]);

  useEffect(() => {
    if (teacher?.tokenId) {
      loadReviews();
    }
  }, [teacher]);

  useEffect(() => {
    checkRentalAccess();
  }, [account, tokenId, signer]);

  useEffect(() => {
    const loadAccount = async () => {
      if (!signer) {
        setAccount("");
        return;
      }

      try {
        const address = await signer.getAddress();

        console.log("Wallet address:", address);

        setAccount(address);
      } catch (error) {
        console.error("Could not get wallet address:", error);
        setAccount("");
      }
    };

    loadAccount();
  }, [signer]);


  const loadTeacher = async () => {
    try {
      if (!signer) return;

      if (!tokenId) {
        console.error("Invalid tokenId:", tokenId);
        return;
      }

      const numericTokenId = Number(tokenId);

      if (Number.isNaN(numericTokenId)) {
        console.error(
          "Invalid numeric tokenId:",
          tokenId
        );
        return;
      }

      console.log(
        "Loading Teacher Token:",
        numericTokenId
      );



      const contract = new ethers.Contract(
        NFT_CONTRACT,
        abi.abi,
        signer
      );

      console.log("=================================");

      // ==========================================
      // GET TEACHER
      // ==========================================

      const teacherInfo =
        await contract.getTeacher(
          numericTokenId
        );

      console.log(
        "Teacher:",
        teacherInfo
      );

      const tokenUri = await contract.tokenURI(numericTokenId);

      console.log("========== NFT METADATA DEBUG ==========");
      console.log("Token ID:", numericTokenId);
      console.log("Token URI:", tokenUri);
      console.log("========================================");

      // ==========================================
      // OWNER
      // ==========================================

      const owner =
        await contract.ownerOf(
          numericTokenId
        );

      console.log("=================================");
      console.log("NFT TOKEN ID:", numericTokenId);
      console.log("NFT OWNER:", owner);
      const connectedAccount = await signer.getAddress();

      console.log("CONNECTED WALLET:", connectedAccount);
      console.log(
        "OWNER MATCH:",
        owner.toLowerCase() === connectedAccount.toLowerCase()
      );
      console.log("=================================");

      console.log(
        "Owner:",
        owner
      );

      // ==========================================
      // SKILLS
      // ==========================================

      let skills = [];

      try {
        skills =
          await contract.getSkills(
            numericTokenId
          );
      } catch (error) {
        console.log(
          "Skills not available:",
          error
        );
      }

      // ==========================================
      // MINT PRICE
      // ==========================================

      let mintPrice = "0";

      if (
        teacherInfo.mintPrice !== undefined &&
        teacherInfo.mintPrice !== null
      ) {
        mintPrice =
          ethers.formatEther(
            teacherInfo.mintPrice
          );
      }

      // ==========================================
      // MARKETPLACE
      // ==========================================

      const marketplace =
        await getMarketplaceContract();

      const listing =
        await marketplace.getListing(
          numericTokenId
        );

      console.log(
        "Listing:",
        listing
      );

      let salePrice = "0";

      if (
        listing.price !== undefined &&
        listing.price !== null
      ) {
        salePrice =
          ethers.formatEther(
            listing.price
          );
      }

      // ==========================================
      // RENTAL
      // ==========================================

      const rental =
        await getRentalContract();

      const rentalInfo =
        await rental.getRental(
          numericTokenId
        );

      console.log(
        "Rental Info:",
        rentalInfo
      );

      console.log("========== CONTRACT RESULT DEBUG ==========");

      console.log("TEACHER INFO:", teacherInfo);
      console.log("TEACHER INFO LENGTH:", teacherInfo?.length);

      console.log("LISTING:", listing);
      console.log("LISTING LENGTH:", listing?.length);

      console.log("RENTAL INFO:", rentalInfo);
      console.log("RENTAL INFO LENGTH:", rentalInfo?.length);

      console.log("============================================");

      let rentPrice = "0";

      // if (
      //   rentalInfo[0] !== undefined &&
      //   rentalInfo[0] !== null
      // ) {
      //   rentPrice = ethers.formatEther(
      //     rentalInfo[0]
      //   );
      // }

      if (rentalInfo && rentalInfo.length > 0) {
        rentPrice = ethers.formatEther(rentalInfo[0]);
      }

      // console.log("FINAL TEACHER OBJECT:", {
      //   tokenId: numericTokenId,
      //   name: teacherInfo[0],
      //   subject: teacherInfo[1],
      //   topic: teacherInfo[2],
      //   specialization: teacherInfo[3],
      //   price: mintPrice,
      //   owner: owner,
      //   skills: skills || [],
      //   //forSale: Boolean(listing[1]),
      //   forSale: listing && listing.length > 1
      //     ? Boolean(listing[1])
      //     : false,
      //   salePrice: salePrice,
      //   //forRent: Boolean(rentalInfo[1]),
      //   forRent: rentalInfo && rentalInfo.length > 1
      //     ? Boolean(rentalInfo[1])
      //     : false,
      //   rentPricePerDay: rentPrice
      // });

      console.log("FINAL DEBUG:");
      console.log("teacherInfo:", teacherInfo);
      console.log("teacherInfo length:", teacherInfo?.length);
      console.log("listing:", listing);
      console.log("listing length:", listing?.length);
      console.log("rentalInfo:", rentalInfo);
      console.log("rentalInfo length:", rentalInfo?.length);

      const teacherObject = {
        tokenId: numericTokenId,

        name: teacherInfo?.[0] ?? "",
        subject: teacherInfo?.[1] ?? "",
        topic: teacherInfo?.[2] ?? "",

        // TEMPORARILY remove teacherInfo[3]
        specialization: "",

        price: mintPrice,
        owner: owner,
        skills: skills || [],

        forSale:
          listing && listing.length > 1
            ? Boolean(listing[1])
            : false,

        salePrice: salePrice,

        forRent:
          rentalInfo && rentalInfo.length > 1
            ? Boolean(rentalInfo[1])
            : false,

        rentPricePerDay: rentPrice
      };

      console.log("FINAL TEACHER OBJECT:", teacherObject);

      setTeacher(teacherObject);

      setTeacher({
        tokenId: numericTokenId,

        name: teacherInfo[0],
        subject: teacherInfo[1],
        topic: teacherInfo[2],
        specialization: teacherInfo[3],

        // Your current Teacher struct doesn't contain these
        level: "N/A",
        experience: "N/A",

        price: mintPrice,
        owner: owner,
        skills: skills || [],

        forSale: Boolean(listing[1]),
        salePrice: salePrice,

        forRent: Boolean(rentalInfo[1]),
        rentPricePerDay: rentPrice




      });

    } catch (error) {

      console.error(
        "loadTeacher ERROR:",
        error
      );

    } finally {

      setLoading(false);
    }
  };



  async function checkRentalAccess() {
    try {
      if (!tokenId || !account) {
        console.log(
          "Skipping rental check:",
          { tokenId, account }
        );
        return;
      }

      const numericTokenId = Number(tokenId);

      if (Number.isNaN(numericTokenId)) {
        console.error(
          "Invalid tokenId for rental:",
          tokenId
        );
        return;
      }

      const rentalContract =
        getRentalContract(signer);

      const access =
        await rentalContract.hasAccess(
          numericTokenId,
          account
        );

      setHasRentalAccess(access);

    } catch (error) {
      console.error(
        "Rental access error:",
        error
      );
    }
  }



  // const checkSubscription = async () => {
  //   try {
  //     if (!signer) return;

  //     const subscriptionContract =
  //       await getSubscriptionContract();



  //     // const walletAddress =
  //     //   await signer.getAddress();

  //     const active =
  //       await subscriptionContract.hasSubscription(
  //        tokenId,
  //         walletAddress
  //       );



  //     setSubscriptionActive(active);

  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  async function checkSubscription() {
    try {
      if (!tokenId || !account) {
        console.log(
          "Skipping subscription check:",
          { tokenId, account }
        );
        return;
      }

      const numericTokenId = Number(tokenId);

      if (Number.isNaN(numericTokenId)) {
        console.error(
          "Invalid tokenId for subscription:",
          tokenId
        );
        return;
      }

      const contract =
        getSubscriptionContract(signer);

      const active =
        await contract.hasSubscription(
          numericTokenId,
          account
        );

      setHasSubscription(active);

    } catch (error) {
      console.error(
        "Subscription check error:",
        error
      );
    }
  }

  // const loadRating = async () => {

  //   try {

  //     const response = await fetch(
  //       `http://localhost:5000/api/reviews/rating/${id}`
  //     );

  //     const data = await response.json();

  //     setRatingInfo(data);

  //   } catch (error) {

  //     console.error(error);

  //   }

  // };

  const submitReview = async () => {

    if (!account) {
      alert("Connect wallet first");
      return;
    }

    if (!comment.trim()) {
      alert("Please write a review");
      return;
    }

    if (!teacher?.tokenId) {
      alert("Teacher not loaded");
      return;
    }

    try {

      const response = await fetch(
        "http://localhost:5000/api/reviews",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            tokenId: Number(teacher.tokenId),
            student: account,
            rating: Number(rating),
            comment: comment.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit review"
        );
      }

      console.log("Review submitted:", data);

      setComment("");
      setRating("5");

      // Reload reviews and rating
      await loadReviews();

      alert("Review submitted successfully");

    } catch (error) {

      console.error(
        "Submit review error:",
        error
      );

      alert(error.message);
    }
  };

  const listForSale = async () => {
    try {
      if (!signer) {
        alert("Connect wallet first");
        return;
      }

      if (!teacher?.tokenId) {
        alert("Teacher not loaded");
        return;
      }

      if (!salePrice || Number(salePrice) <= 0) {
        alert("Please enter a valid sale price");
        return;
      }

      const nftContract = new ethers.Contract(
        NFT_CONTRACT,
        abi.abi,
        signer
      );

      const marketplace = await getMarketplaceContract();

      console.log("Approving marketplace...");

      // Approve marketplace to transfer this NFT
      const approveTx = await nftContract.approve(
        await marketplace.getAddress(),
        teacher.tokenId
      );

      await approveTx.wait();

      console.log("Marketplace approved");

      // Now list NFT
      const tx = await marketplace.listNFT(
        teacher.tokenId,
        ethers.parseEther(salePrice)
      );

      console.log("Listing TX:", tx.hash);

      await tx.wait();

      alert("NFT listed for sale successfully");

      await loadTeacher();

    } catch (err) {
      console.error("LIST FOR SALE ERROR:", err);

      alert(
        err.shortMessage ||
        err.reason ||
        err.message ||
        "Failed to list NFT"
      );
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
          teacher?.tokenId,
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
          teacher?.tokenId,
          ethers.parseEther(monthlyPrice.toString()),
          ethers.parseEther(yearlyPrice.toString())
        );

      await tx.wait();

      alert("Subscription prices updated");

      loadSubscriptionPrices(teacher?.tokenId);

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
          teacher?.tokenId
        );

      await tx.wait();

      loadTeacher();
    } catch (err) {
      console.error(err);
    }
  };

  const buyNFT = async () => {
    try {
      if (!signer) {
        alert("Please connect your wallet first");
        return;
      }

      if (!teacher?.tokenId) {
        alert("Teacher not loaded");
        return;
      }

      if (!teacher.forSale) {
        alert("This teacher is not listed for sale");
        return;
      }

      if (isOwner) {
        alert("Owner cannot buy their own NFT");
        return;
      }

      const marketplace = await getMarketplaceContract();

      const listing = await marketplace.getListing(
        teacher.tokenId
      );

      console.log("Listing:", listing);

      if (!listing.active) {
        alert("NFT is no longer listed");
        return;
      }

      if (!listing.price || listing.price === 0n) {
        alert("Invalid listing price");
        return;
      }

      const tx = await marketplace.buyNFT(
        teacher.tokenId,
        {
          value: listing.price
        }
      );

      console.log("Buy transaction:", tx.hash);

      await tx.wait();

      alert("NFT purchased successfully!");

      await loadTeacher();

    } catch (err) {
      console.error("BUY NFT ERROR:", err);

      alert(
        err.shortMessage ||
        err.reason ||
        err.message ||
        "Failed to buy NFT"
      );
    }
  };

  const rentNFT = async () => {
    try {
      if (!signer) {
        alert("Connect wallet first");
        return;
      }

      if (!teacher?.tokenId) {
        alert("Teacher not loaded");
        return;
      }

      if (!teacher.forRent) {
        alert("This teacher is not available for rent");
        return;
      }

      if (isOwner) {
        alert("Owner cannot rent their own NFT");
        return;
      }

      if (!daysCount || daysCount <= 0) {
        alert("Enter valid number of days");
        return;
      }

      const rental = await getRentalContract();

      const totalRent =
        Number(teacher.rentPricePerDay) * Number(daysCount);

      console.log("Rent price per day:", teacher.rentPricePerDay);
      console.log("Days:", daysCount);
      console.log("Total rent:", totalRent);

      const tx = await rental.rentTeacher(
        teacher.tokenId,
        daysCount,
        {
          value: ethers.parseEther(
            totalRent.toString()
          )
        }
      );

      console.log("Rental transaction:", tx.hash);

      await tx.wait();

      alert("NFT rented successfully!");

      // Reload rental status
      await checkRentalAccess();

      await loadTeacher();

    } catch (err) {
      console.error("RENT NFT ERROR:", err);

      alert(
        err.shortMessage ||
        err.reason ||
        err.message ||
        "Failed to rent NFT"
      );
    }
  };

  const approveMarketplace = async () => {
    try {
      if (!signer) {
        alert("Connect owner wallet first");
        return;
      }

      if (!teacher?.tokenId) {
        alert("Teacher not loaded");
        return;
      }

      const nftContract = new ethers.Contract(
        NFT_CONTRACT,
        abi.abi,
        signer
      );

      const marketplace =
        await getMarketplaceContract();

      const marketplaceAddress =
        await marketplace.getAddress();

      console.log("Marketplace:", marketplaceAddress);
      console.log("TokentokenId:", teacher.tokenId);

      const tx = await nftContract.approve(
        marketplaceAddress,
        teacher.tokenId
      );

      console.log("Approval TX:", tx.hash);

      await tx.wait();

      alert("Marketplace approved successfully");

    } catch (err) {
      console.error("Approval error:", err);

      alert(
        err.shortMessage ||
        err.reason ||
        err.message ||
        "Approval failed"
      );
    }
  };

  const loadReviews = async () => {

    if (!teacher?.tokenId) return;

    try {

      const tokenId = teacher.tokenId;

      // Rating summary
      const ratingResponse = await fetch(
        `http://localhost:5000/api/reviews/rating/${tokenId}`
      );

      if (!ratingResponse.ok) {
        throw new Error(
          `Rating API error: ${ratingResponse.status}`
        );
      }

      const ratingData = await ratingResponse.json();

      setRatingInfo(ratingData);


      // Reviews
      const reviewsResponse = await fetch(
        `http://localhost:5000/api/reviews/${tokenId}`
      );

      if (!reviewsResponse.ok) {
        throw new Error(
          `Reviews API error: ${reviewsResponse.status}`
        );
      }

      const reviewsData = await reviewsResponse.json();

      setReviews(reviewsData);

    } catch (error) {

      console.error(
        "Review loading error:",
        error
      );

    }
  };



  <div className="review-box">

    <div className="rating-summary">

      <h2>
        ⭐ {ratingInfo.average} / 5
      </h2>

      <p>
        {ratingInfo.count} Reviews
      </p>

    </div>

    <h2>Student Reviews</h2>

    <textarea
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      placeholder="Write your review"
    />


    <select
      value={rating}
      onChange={(e) => setRating(e.target.value)}
    >
      <option value="5">★★★★★</option>
      <option value="4">★★★★</option>
      <option value="3">★★★</option>
      <option value="2">★★</option>
      <option value="1">★</option>
    </select>


    <button onClick={submitReview}>
      Submit Review
    </button>


    {/* Display Reviews */}

    <h2>Reviews</h2>

    {
      reviews.map((review, index) => (

        <div key={index} className="review-item">

          <p>
            ⭐ {review.rating}/5
          </p>

          <p>
            {review.comment}
          </p>

          <small>
            {review.student}
          </small>

        </div>

      ))
    }


  </div>

  const normalizedOwner = teacher?.owner?.toLowerCase() || "";
  const normalizedAccount = account?.toLowerCase() || "";

  const isOwner =
    normalizedOwner !== "" &&
    normalizedAccount !== "" &&
    normalizedOwner === normalizedAccount;

  console.log("================================");
  console.log("Teacher Owner:", normalizedOwner);
  console.log("Connected Account:", normalizedAccount);
  console.log("IS OWNER:", isOwner);
  console.log("================================");

  if (loading) {
    return (
      <h2>Loading Teacher...</h2>
    );
  }


  if (!teacher) {
    return (
      <div>
        <h2>Teacher Not Found</h2>

        <Link to="/">
          Back to Home
        </Link>
      </div>
    );
  }



  return (
    <div className="container">
      <div className="metadata-card">
        <h1>{teacher?.name}</h1>

        <h3>TokentokenId</h3>
        <p>{teacher?.tokenId}</p>

        <h3>Specialization</h3>
        <p>{teacher?.specialization}</p>

        <h3>Level</h3>
        <p>{teacher?.level}</p>

        <h3>Experience</h3>
        <p>{teacher?.experience}</p>

        <h3>Owner Wallet</h3>
        <p>{teacher?.owner}</p>

        <h3>NFT Price</h3>
        <p>{teacher?.price} POL</p>

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

        {rentalExpiry > Math.floor(Date.now() / 1000) ? (
          <>
            <p>
              🟢 Your Rental Is Active
            </p>

            <p>
              Rental expires:{" "}
              {new Date(
                rentalExpiry * 1000
              ).toLocaleString()}
            </p>
          </>
        ) : (
          <p>
            🔴 You don't have an active rental
          </p>
        )}

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

        {/* <div className="button-group">
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
              to={`/subscription/${teacher?.tokenId}`}
            >
              <button>
                Subscribe
              </button>
            </Link>
          )
        } */}

        {isOwner && (
          <button onClick={approveMarketplace}>
            Approve Marketplace
          </button>
        )}

        {/* =====================================================
    OWNER ACTIONS
===================================================== */}

        {/* =====================================================
    OWNER BUTTONS
===================================================== */}

        {isOwner && (
          <div className="button-group">

            {/* List For Sale */}
            {!teacher.forSale && (
              <>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Sale Price (POL)"
                  value={salePrice}
                  onChange={(e) =>
                    setSalePrice(e.target.value)
                  }
                />

                <button onClick={listForSale}>
                  List For Sale
                </button>
              </>
            )}

            {/* List For Rent */}
            {!teacher.forRent && (
              <>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Rent Price Per Day (POL)"
                  value={rentPrice}
                  onChange={(e) =>
                    setRentPrice(e.target.value)
                  }
                />

                <button onClick={listForRent}>
                  List For Rent
                </button>
              </>
            )}

            {/* Cancel Sale */}
            {teacher.forSale && (
              <button onClick={cancelSale}>
                Cancel Sale
              </button>
            )}

          </div>
        )}


        {/* =====================================================
    BUY BUTTON - ONLY NON OWNER
===================================================== */}

        {!isOwner && teacher.forSale && (
          <div className="button-group">

            <button onClick={buyNFT}>
              Buy NFT
            </button>

          </div>
        )}


        {/* =====================================================
    RENT BUTTON - ONLY NON OWNER
===================================================== */}

        {!isOwner && teacher.forRent && (
          <div className="button-group">

            <input
              type="number"
              min="1"
              value={daysCount}
              onChange={(e) =>
                setDaysCount(Number(e.target.value))
              }
            />

            <button onClick={rentNFT}>
              Rent NFT
            </button>

          </div>
        )}


        {/* =====================================================
    SUBSCRIBE - ONLY NON OWNER
===================================================== */}

        {!isOwner && !subscriptionActive && (
          <div className="button-group">

            <Link to={`/subscription/${teacher.tokenId}`}>
              <button>
                Subscribe
              </button>
            </Link>

          </div>
        )}
        <div className="review-box">


          <h2>
            ⭐ {ratingInfo.average}/5
          </h2>

          <p>
            {ratingInfo.count} Reviews
          </p>


          <h2>
            Student Reviews
          </h2>


          <textarea

            value={comment}

            onChange={(e) =>
              setComment(e.target.value)
            }

            placeholder="Write your review"
          />


          <select

            value={rating}

            onChange={(e) =>
              setRating(e.target.value)
            }

          >

            <option value="5">
              ★★★★★
            </option>

            <option value="4">
              ★★★★
            </option>

            <option value="3">
              ★★★
            </option>

            <option value="2">
              ★★
            </option>

            <option value="1">
              ★
            </option>


          </select>



          <button onClick={submitReview}>
            Submit Review
          </button>



          {
            reviews.map((review, index) => (

              <div
                key={index}
                className="review-item"
              >

                <p>
                  ⭐ {review.rating}/5
                </p>


                <p>
                  {review.comment}
                </p>


                <small>
                  {review.student}
                </small>


              </div>

            ))
          }


        </div>



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


