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

      const provider = new ethers.BrowserProvider(window.ethereum);

      const contract = new ethers.Contract(
        NFT_CONTRACT,
        abi.abi || abi,
        provider
      );

      console.log("Connected teacher wallet:", walletAddress);

      // Get all NFTs and find the ones owned by this wallet
      const totalSupply = await contract.getTotalSupply();

      console.log("Total NFT supply:", totalSupply.toString());

      const tokenIds = [];

      for (let i = 1; i <= Number(totalSupply); i++) {
        try {
          const owner = await contract.ownerOf(i);

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
        } catch (error) {
          console.log(
            `Skipping token ${i}:`,
            error.message
          );
        }
      }

      console.log(
        "Teacher owned token IDs:",
        tokenIds
      );

      const loadedTeachers = [];

      let totalStudents = 0;
      let totalSubscribers = 0;
      let totalReviews = 0;
      let ratingSum = 0;

      for (const id of tokenIds) {
        const tokenId = Number(id);

        try {
          const teacherInfo = await contract.getTeacher(tokenId);

          console.log("Teacher data:", teacherInfo);

          console.log("========== TEACHER DATA ==========");
          console.log("Token ID:", tokenId);

          console.log("Teacher Info:", teacherInfo);
          console.log("Teacher Market:", teacherMarket);
          console.log("Teacher Stats:", teacherStats);

          console.log("Market price:", teacherMarket.price);
          console.log("Rent price:", teacherMarket.rentPricePerDay);

          console.log("Stats revenue:", teacherStats.totalRevenue);

          console.log("==================================");

          let metadata = null;

          try {
            const tokenURI = await contract.tokenURI(tokenId);

            if (tokenURI) {
              let metadataURL = tokenURI;

              if (metadataURL.startsWith("ipfs://")) {
                metadataURL =
                  "https://gateway.pinata.cloud/ipfs/" +
                  metadataURL.replace("ipfs://", "");
              }

              const metadataResponse = await fetch(metadataURL);

              if (metadataResponse.ok) {
                metadata = await metadataResponse.json();
              }
            }
          } catch (metadataError) {
            console.log(
              `Metadata unavailable for token ${tokenId}`,
              metadataError
            );
          }

          const teacher = {
            tokenId,

            name: teacherInfo.name,
            subject: teacherInfo.subject,
            topic: teacherInfo.topic,
            specialization: teacherInfo.specialization,

            price:
              teacherInfo.mintPrice != null
                ? ethers.formatEther(teacherInfo.mintPrice)
                : "0",

            forSale: false,

            rentPricePerDay: "0",
            forRent: false,

            experience: 0,
            level: 0,

            rating: 0,
            reviewCount: 0,

            totalStudents: 0,
            activeSubscribers: 0,

            totalRevenue: "0",

            lessonsCompleted: 0,
            questionsAnswered: 0,

            likes: 0,
            profileViews: 0,

            successRate: 0,

            metadata,
          };

          loadedTeachers.push(teacher);

          totalStudents += teacher.totalStudents;
          totalSubscribers += teacher.activeSubscribers;
          totalReviews += teacher.reviewCount;
          ratingSum += teacher.rating;
        } catch (teacherError) {
          console.error(
            `Failed to load teacher ${tokenId}`,
            teacherError
          );
        }
      }

      setTeachers(loadedTeachers);

      setStats({
        teachers: loadedTeachers.length,
        students: totalStudents,
        subscribers: totalSubscribers,
        reviews: totalReviews,
        rating:
          loadedTeachers.length > 0
            ? (ratingSum / loadedTeachers.length).toFixed(1)
            : 0,
      });
    } catch (err) {
      console.error("Teacher dashboard error:", err);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">
          Loading teacher dashboard...
        </p>
      </div>
    );
  }

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
                  window.location.href = "/create-teacher";
                }}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg"
              >
                Create AI Teacher
              </button>

            </div>
          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {teachers.map((teacher) => (

                <TeacherCard
                  key={teacher.tokenId}
                  teacher={teacher}
                />

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({ title, value }) {
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


/* =====================================================
   TEACHER CARD
===================================================== */

function TeacherCard({ teacher }) {

  const image =
    teacher.metadata?.image?.startsWith("ipfs://")
      ? "https://gateway.pinata.cloud/ipfs/" +
      teacher.metadata.image.replace("ipfs://", "")
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
          Specialization: {teacher.specialization}
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
              ⭐ {teacher.rating}
            </p>
          </div>

        </div>

        {/* STATUS */}

        <div className="mt-5 space-y-2">

          <div className="flex justify-between text-sm">

            <span>Sale</span>

            <span
              className={
                teacher.forSale
                  ? "text-green-600"
                  : "text-gray-400"
              }
            >
              {teacher.forSale ? "Listed" : "Not Listed"}
            </span>

          </div>

          <div className="flex justify-between text-sm">

            <span>Rental</span>

            <span
              className={
                teacher.forRent
                  ? "text-green-600"
                  : "text-gray-400"
              }
            >
              {teacher.forRent ? "Available" : "Not Available"}
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