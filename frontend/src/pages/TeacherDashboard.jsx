import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../context/WalletContext";
import abi from "../contracts/AITeacherNFT.json";
import { NFT_CONTRACT } from "../contracts/config";

function TeacherDashboard() {
  const { walletAddress } = useWallet();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    subscribers: 0,
    reviews: 0,
    rating: 0,
  });

  useEffect(() => {
    if (walletAddress) {
      loadTeacherDashboard();
    } else {
      setTeachers([]);
      setLoading(false);
    }
  }, [walletAddress]);

  async function loadTeacherDashboard() {
    try {
      setLoading(true);
      setError("");

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum
      );

      const contract = new ethers.Contract(
        NFT_CONTRACT,
        abi.abi || abi,
        provider
      );

      console.log(
        "Connected teacher wallet:",
        walletAddress
      );

      // =====================================================
      // GET TOTAL NFT SUPPLY
      // =====================================================

      const totalSupply =
        await contract.getTotalSupply();

      console.log(
        "Total NFT supply:",
        totalSupply.toString()
      );

      // =====================================================
      // FIND NFTs OWNED BY CONNECTED WALLET
      // =====================================================

      const tokenIds = [];

      for (
        let i = 0;
        i < Number(totalSupply);
        i++
      ) {
        try {
          const owner =
            await contract.ownerOf(i);

          console.log(
            `Token ${i} owner:`,
            owner
          );

          if (
            owner.toLowerCase() ===
            walletAddress.toLowerCase()
          ) {
            tokenIds.push(i);
          }
        } catch (ownerError) {
          console.log(
            `Skipping token ${i}:`,
            ownerError.message
          );
        }
      }

      console.log(
        "Teacher owned token IDs:",
        tokenIds
      );

      // =====================================================
      // DASHBOARD TOTALS
      // =====================================================

      const loadedTeachers = [];

      let totalStudents = 0;
      let totalSubscribers = 0;
      let totalReviews = 0;
      let ratingSum = 0;

      // =====================================================
      // LOAD EACH TEACHER
      // =====================================================

      for (const id of tokenIds) {
        const tokenId = Number(id);

        try {
          console.log(
            "===================================="
          );

          console.log(
            "Loading teacher:",
            tokenId
          );

          // =================================================
          // LOAD REVIEWS FROM BACKEND
          // =================================================

          let reviewCount = 0;
          let averageRating = 0;

          try {
            /*
             * IMPORTANT:
             *
             * If your backend route is:
             *
             * /api/reviews/rating/:tokenId
             *
             * change this URL to:
             *
             * http://localhost:5000/api/reviews/rating/${tokenId}
             */

            const REVIEW_API_URL =
              `http://localhost:5000/api/reviews/${tokenId}`;

            const reviewResponse =
              await fetch(REVIEW_API_URL);

            console.log(
              `Review API status for token ${tokenId}:`,
              reviewResponse.status
            );

            if (reviewResponse.ok) {
              const reviewData =
                await reviewResponse.json();

              console.log(
                `Reviews for token ${tokenId}:`,
                reviewData
              );

              /*
               * Support different possible backend formats:
               *
               * 1. [ review1, review2 ]
               *
               * 2. { reviews: [...] }
               *
               * 3. { count: 5, rating: 4.5 }
               *
               * 4. { reviewCount: 5, averageRating: 4.5 }
               */

              if (Array.isArray(reviewData)) {
                const reviews = reviewData;

                reviewCount =
                  reviews.length;

                if (reviews.length > 0) {
                  const totalRating =
                    reviews.reduce(
                      (sum, review) =>
                        sum +
                        Number(
                          review.rating || 0
                        ),
                      0
                    );

                  averageRating =
                    totalRating /
                    reviews.length;
                }
              } else {
                const reviews =
                  Array.isArray(
                    reviewData.reviews
                  )
                    ? reviewData.reviews
                    : [];

                if (reviews.length > 0) {
                  reviewCount =
                    reviews.length;

                  const totalRating =
                    reviews.reduce(
                      (sum, review) =>
                        sum +
                        Number(
                          review.rating || 0
                        ),
                      0
                    );

                  averageRating =
                    totalRating /
                    reviews.length;
                } else {
                  reviewCount = Number(
                    reviewData.reviewCount ??
                    reviewData.count ??
                    0
                  );

                  averageRating = Number(
                    reviewData.averageRating ??
                    reviewData.rating ??
                    0
                  );
                }
              }

              console.log(
                "FINAL REVIEW COUNT:",
                reviewCount
              );

              console.log(
                "FINAL AVERAGE RATING:",
                averageRating
              );
            } else {
              console.warn(
                `Review API failed for token ${tokenId}`
              );
            }
          } catch (reviewError) {
            console.error(
              `Failed to load reviews for token ${tokenId}:`,
              reviewError
            );
          }

          // =================================================
          // LOAD TEACHER FROM BLOCKCHAIN
          // =================================================

          const result =
            await contract.getTeacher(
              tokenId
            );

          console.log(
            "RAW getTeacher RESULT:",
            result
          );

          const teacherInfo =
            result[0];

          const teacherMarket =
            result[1];

          const teacherStats =
            result[2];

          console.log("========== STUDENT DEBUG ==========");
          console.log("Token ID:", tokenId);
          console.log("Teacher Stats:", teacherStats);

          console.log(
            "totalStudents:",
            teacherStats?.totalStudents
          );

          console.log(
            "totalStudents [2]:",
            teacherStats?.[2]
          );

          console.log(
            "activeSubscribers:",
            teacherStats?.activeSubscribers
          );

          console.log(
            "activeSubscribers [3]:",
            teacherStats?.[3]
          );

          console.log("==================================");

          console.log(
            "========== TEACHER DATA =========="
          );

          console.log(
            "Token ID:",
            tokenId
          );

          console.log(
            "Teacher Info:",
            teacherInfo
          );

          console.log(
            "Teacher Market:",
            teacherMarket
          );

          console.log(
            "Teacher Stats:",
            teacherStats
          );

          // =================================================
          // LOAD METADATA
          // =================================================

          let metadata = null;

          try {
            const tokenURI =
              await contract.tokenURI(
                tokenId
              );

            console.log(
              `Token ${tokenId} URI:`,
              tokenURI
            );

            if (tokenURI) {
              let metadataURL =
                tokenURI;

              if (
                metadataURL.startsWith(
                  "ipfs://"
                )
              ) {
                metadataURL =
                  "https://gateway.pinata.cloud/ipfs/" +
                  metadataURL.replace(
                    "ipfs://",
                    ""
                  );
              }

              const metadataResponse =
                await fetch(
                  metadataURL
                );

              if (
                metadataResponse.ok
              ) {
                metadata =
                  await metadataResponse.json();

                console.log(
                  `Metadata for token ${tokenId}:`,
                  metadata
                );
              }
            }
          } catch (metadataError) {
            console.log(
              `Metadata unavailable for token ${tokenId}`,
              metadataError
            );
          }

          // =================================================
          // SAFE FIELD HELPERS
          // =================================================

          const formatEtherSafe = (
            value
          ) => {
            try {
              if (
                value === undefined ||
                value === null
              ) {
                return "0";
              }

              return ethers.formatEther(
                value
              );
            } catch {
              return "0";
            }
          };

          const numberSafe = (
            value
          ) => {
            try {
              if (
                value === undefined ||
                value === null
              ) {
                return 0;
              }

              return Number(value);
            } catch {
              return 0;
            }
          };

          // =================================================
          // CREATE TEACHER OBJECT
          // =================================================

          const teacher = {
            tokenId,

            // -------------------------
            // TEACHER INFO
            // -------------------------

            name:
              teacherInfo?.name ??
              teacherInfo?.[0] ??
              "",

            subject:
              teacherInfo?.subject ??
              teacherInfo?.[1] ??
              "",

            topic:
              teacherInfo?.topic ??
              teacherInfo?.[2] ??
              "",

            specialization:
              teacherInfo?.specialization ??
              teacherInfo?.[3] ??
              "",

            // -------------------------
            // MARKET DATA
            // -------------------------

            price:
              formatEtherSafe(
                teacherMarket?.price ??
                teacherMarket?.[0]
              ),

            forSale:
              Boolean(
                teacherMarket?.forSale ??
                teacherMarket?.[1] ??
                false
              ),

            rentPricePerDay:
              formatEtherSafe(
                teacherMarket?.rentPricePerDay ??
                teacherMarket?.[2]
              ),

            forRent:
              Boolean(
                teacherMarket?.forRent ??
                teacherMarket?.[3] ??
                false
              ),

            // -------------------------
            // TEACHER STATS
            // -------------------------

            experience:
              numberSafe(
                teacherStats?.experience ??
                teacherStats?.[0]
              ),

            level:
              numberSafe(
                teacherStats?.level ??
                teacherStats?.[1]
              ),

            /*
             * Reviews and rating are coming
             * from MongoDB/backend because
             * your submitReview() uses:
             *
             * POST /api/reviews
             */

            rating:
              averageRating,

            reviewCount:
              reviewCount,

            totalStudents:
              numberSafe(
                teacherStats?.totalStudents ??
                teacherStats?.[2]
              ),

            activeSubscribers:
              numberSafe(
                teacherStats?.activeSubscribers ??
                teacherStats?.[3]
              ),

            totalRevenue:
              formatEtherSafe(
                teacherStats?.totalRevenue ??
                teacherStats?.[4]
              ),

            lessonsCompleted:
              numberSafe(
                teacherStats?.lessonsCompleted ??
                teacherStats?.[5]
              ),

            questionsAnswered:
              numberSafe(
                teacherStats?.questionsAnswered ??
                teacherStats?.[6]
              ),

            likes:
              numberSafe(
                teacherStats?.likes ??
                teacherStats?.[7]
              ),

            profileViews:
              numberSafe(
                teacherStats?.profileViews ??
                teacherStats?.[8]
              ),

            successRate:
              numberSafe(
                teacherStats?.successRate ??
                teacherStats?.[9]
              ),

            averageResponseTime:
              numberSafe(
                teacherStats?.averageResponseTime ??
                teacherStats?.[10]
              ),

            // -------------------------
            // IPFS METADATA
            // -------------------------

            metadata,
          };

          console.log(
            "FINAL TEACHER OBJECT:",
            teacher
          );

          loadedTeachers.push(
            teacher
          );

          // =================================================
          // UPDATE DASHBOARD TOTALS
          // =================================================

          totalStudents +=
            teacher.totalStudents;

          totalSubscribers +=
            teacher.activeSubscribers;

          totalReviews +=
            teacher.reviewCount;

          ratingSum +=
            teacher.rating;

        } catch (teacherError) {
          console.error(
            `Failed to load teacher ${tokenId}`,
            teacherError
          );
        }
      }

      // =====================================================
      // SET TEACHERS
      // =====================================================

      setTeachers(
        loadedTeachers
      );

      // =====================================================
      // SET DASHBOARD STATS
      // =====================================================

      setStats({
        teachers:
          loadedTeachers.length,

        students:
          totalStudents,

        subscribers:
          totalSubscribers,

        reviews:
          totalReviews,

        rating:
          loadedTeachers.length > 0
            ? (
              ratingSum /
              loadedTeachers.length
            ).toFixed(1)
            : "0.0",
      });

      console.log(
        "========== FINAL DASHBOARD STATS =========="
      );

      console.log(
        "Teachers:",
        loadedTeachers.length
      );

      console.log(
        "Students:",
        totalStudents
      );

      console.log(
        "Subscribers:",
        totalSubscribers
      );

      console.log(
        "Reviews:",
        totalReviews
      );

      console.log(
        "Rating:",
        ratingSum /
        Math.max(
          loadedTeachers.length,
          1
        )
      );

    } catch (err) {
      console.error(
        "Teacher dashboard error:",
        err
      );

      setError(
        err?.reason ||
        err?.shortMessage ||
        err?.message ||
        "Failed to load teacher dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // WALLET NOT CONNECTED
  // =====================================================

  if (!walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">

          <h2 className="text-2xl font-bold mb-3">
            Teacher Dashboard
          </h2>

          <p className="text-gray-500">
            Please connect your wallet to continue.
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">

        <p className="text-lg">
          Loading teacher dashboard...
        </p>

      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Teacher Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your AI Teacher NFTs
          </p>

          <p className="text-xs text-gray-400 mt-2 break-all">
            Wallet: {walletAddress}
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

          <StatCard
            title="My AI Teachers"
            value={stats.teachers}
          />

          <StatCard
            title="Students"
            value={stats.students}
          />

          <StatCard
            title="Subscribers"
            value={stats.subscribers}
          />

          <StatCard
            title="Reviews"
            value={stats.reviews}
          />

          <StatCard
            title="Rating"
            value={`⭐ ${stats.rating}`}
          />

        </div>

        {/* TEACHERS */}

        <div className="bg-white rounded-xl shadow-sm p-6">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-semibold">
                My AI Teachers
              </h2>

              <p className="text-gray-500 text-sm">
                Teachers owned by your connected wallet
              </p>

            </div>

          </div>

          {teachers.length === 0 ? (

            <div className="text-center py-16">

              <p className="text-gray-500 mb-4">
                You don't own any AI Teacher NFTs yet.
              </p>

              <button
                onClick={() => {
                  window.location.href =
                    "/create-teacher";
                }}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg"
              >
                Create AI Teacher
              </button>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {teachers.map(
                (teacher) => (

                  <TeacherCard
                    key={teacher.tokenId}
                    teacher={teacher}
                  />

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  title,
  value,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p className="text-2xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}

// =====================================================
// TEACHER CARD
// =====================================================

function TeacherCard({
  teacher,
}) {
  const image =
    teacher.metadata?.image?.startsWith(
      "ipfs://"
    )
      ? "https://gateway.pinata.cloud/ipfs/" +
      teacher.metadata.image.replace(
        "ipfs://",
        ""
      )
      : teacher.metadata?.image;

  return (
    <div className="border rounded-xl overflow-hidden bg-white">

      {/* IMAGE */}

      {image ? (

        <img
          src={image}
          alt={teacher.name}
          className="w-full h-48 object-cover"
        />

      ) : (

        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">

          <span className="text-gray-500">
            No Image
          </span>

        </div>

      )}

      {/* CONTENT */}

      <div className="p-5">

        <div className="flex justify-between items-start">

          <div>

            <h3 className="text-xl font-semibold">
              {teacher.name}
            </h3>

            <p className="text-gray-500">
              {teacher.subject}
            </p>

          </div>

          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            #{teacher.tokenId}
          </span>

        </div>

        <p className="text-sm text-gray-500 mt-3">
          Topic: {teacher.topic}
        </p>

        <p className="text-sm text-gray-500">
          Specialization:{" "}
          {teacher.specialization}
        </p>

        {/* STATS */}

        <div className="grid grid-cols-2 gap-3 mt-5">

          <div className="bg-gray-50 p-3 rounded">

            <p className="text-xs text-gray-500">
              Students
            </p>

            <p className="font-semibold">
              {teacher.totalStudents}
            </p>

          </div>

          <div className="bg-gray-50 p-3 rounded">

            <p className="text-xs text-gray-500">
              Subscribers
            </p>

            <p className="font-semibold">
              {teacher.activeSubscribers}
            </p>

          </div>

          <div className="bg-gray-50 p-3 rounded">

            <p className="text-xs text-gray-500">
              Reviews
            </p>

            <p className="font-semibold">
              {teacher.reviewCount}
            </p>

          </div>

          <div className="bg-gray-50 p-3 rounded">

            <p className="text-xs text-gray-500">
              Rating
            </p>

            <p className="font-semibold">
              ⭐{" "}
              {Number(
                teacher.rating || 0
              ).toFixed(1)}
            </p>

          </div>

        </div>

        {/* STATUS */}

        <div className="mt-5 space-y-2">

          <div className="flex justify-between text-sm">

            <span>
              Sale
            </span>

            <span
              className={
                teacher.forSale
                  ? "text-green-600"
                  : "text-gray-400"
              }
            >
              {teacher.forSale
                ? "Listed"
                : "Not Listed"}
            </span>

          </div>

          <div className="flex justify-between text-sm">

            <span>
              Rental
            </span>

            <span
              className={
                teacher.forRent
                  ? "text-green-600"
                  : "text-gray-400"
              }
            >
              {teacher.forRent
                ? "Available"
                : "Not Available"}
            </span>

          </div>

        </div>

        {/* BUTTON */}

        <button
          onClick={() =>
          (window.location.href =
            `/teacher/manage/${teacher.tokenId}`)
          }
          className="w-full mt-5 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Manage Teacher
        </button>

      </div>

    </div>
  );
}

export default TeacherDashboard;