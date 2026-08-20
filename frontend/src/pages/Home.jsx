import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";

import TeacherCard from "../components/TeacherCard";

import abi from "../contracts/AITeacherNFT.json";
import { NFT_CONTRACT } from "../contracts/config";

import {
  getMarketplaceContract,
  getRentalContract,
} from "../contracts/contracts";

import { groupBySubject } from "../utils/groupTeachers";

function Home() {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD TEACHERS WHEN HOME OPENS
  // =====================================================

  useEffect(() => {
    loadTeachers();
  }, []);

  // =====================================================
  // LOAD ALL TEACHERS
  // =====================================================

  async function loadTeachers() {
    try {
      setLoading(true);

      if (!window.ethereum) {
        console.log("MetaMask not installed");
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum
      );

      // IMPORTANT:
      // Make sure AITeacherNFT.json is the NEW ABI
      // generated after your latest deployment.
      const contract = new ethers.Contract(
        NFT_CONTRACT,
        abi.abi || abi,
        provider
      );

      // =================================================
      // TOTAL SUPPLY
      // =================================================

      const totalSupply = Number(
        await contract.getTotalSupply()
      );

      console.log(
        "===================================="
      );

      console.log(
        "Total NFT supply:",
        totalSupply
      );

      console.log(
        "===================================="
      );

      const teachersData = [];

      // =================================================
      // YOUR TeacherMint STARTS TOKEN IDS FROM 0
      //
      // tokenCounter initially = 0
      // first NFT = token 0
      // second NFT = token 1
      // etc.
      // =================================================

      for (
        let tokenId = 0;
        tokenId < totalSupply;
        tokenId++
      ) {
        try {
          console.log(
            "Loading teacher token:",
            tokenId
          );

          // =================================================
          // GET TEACHER
          // =================================================

          const result = await contract.getTeacher(
            tokenId
          );

          const teacherInfo = result[0];
          const teacherMarket = result[1];

          console.log(
            "Teacher Info:",
            teacherInfo
          );

          console.log(
            "Teacher Market:",
            teacherMarket
          );

          // =================================================
          // OWNER
          // =================================================

          let owner = "";

          try {
            owner = await contract.teacherOwner(
              tokenId
            );
          } catch (ownerError) {
            console.log(
              `Owner unavailable for token ${tokenId}`,
              ownerError
            );
          }

          // =================================================
          // METADATA
          // =================================================

          let metadata = {};

          try {
            const tokenURI =
              await contract.tokenURI(tokenId);

            console.log(
              `TokenURI ${tokenId}:`,
              tokenURI
            );

            let metadataURL = tokenURI;

            // Convert IPFS URI
            if (
              metadataURL &&
              metadataURL.startsWith("ipfs://")
            ) {
              metadataURL =
                "https://gateway.pinata.cloud/ipfs/" +
                metadataURL.replace(
                  "ipfs://",
                  ""
                );
            }

            if (metadataURL) {
              const response = await fetch(
                metadataURL
              );

              console.log(
                `Metadata response ${tokenId}:`,
                response.status
              );

              if (response.ok) {
                metadata =
                  await response.json();

                console.log(
                  `Metadata ${tokenId}:`,
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
          // MARKETPLACE
          // =================================================

          let listing = {
            price: 0n,
            active: false,
          };

          try {
            const marketplace =
              await getMarketplaceContract();

            const listingResult =
              await marketplace.getListing(
                tokenId
              );

            listing = {
              price: listingResult[0],
              active: listingResult[1],
            };

            console.log(
              `Listing for ${tokenId}:`,
              listing
            );
          } catch (marketError) {
            console.log(
              `Marketplace unavailable for ${tokenId}`,
              marketError
            );
          }

          // =================================================
          // RENTAL
          // =================================================

          let rentalInfo = {
            pricePerDay: 0n,
            available: false,
          };

          try {
            const rental =
              await getRentalContract();

            const rentalResult =
              await rental.getRental(
                tokenId
              );

            rentalInfo = {
              pricePerDay: rentalResult[0],
              available: rentalResult[1],
            };

            console.log(
              `Rental for ${tokenId}:`,
              rentalInfo
            );
          } catch (rentalError) {
            console.log(
              `Rental unavailable for ${tokenId}`,
              rentalError
            );
          }

          // =================================================
          // IMAGE
          // =================================================

          let imageUrl = "";

          if (metadata.image) {
            imageUrl = metadata.image;

            if (
              imageUrl.startsWith("ipfs://")
            ) {
              imageUrl =
                "https://gateway.pinata.cloud/ipfs/" +
                imageUrl.replace(
                  "ipfs://",
                  ""
                );
            }
          }

          // =================================================
          // CREATE TEACHER OBJECT
          // =================================================

          const teacher = {
            id: tokenId,

            tokenId: tokenId,

            name:
              teacherInfo.name || "",

            subject:
              teacherInfo.subject?.trim() || "",

            topic:
              teacherInfo.topic || "",

            specialization:
              teacherInfo.specialization || "",

            // TeacherMarket.price
            mintPrice:
              teacherMarket.price != null
                ? teacherMarket.price.toString()
                : "0",

            // Metadata
            imageUrl: imageUrl,

            description:
              metadata.description || "",

            ownerWallet:
              owner,

            // Marketplace
            forSale:
              Boolean(listing.active),

            salePrice:
              listing.price != null &&
                listing.price > 0n
                ? ethers.formatEther(
                  listing.price
                )
                : "0",

            // Rental
            forRent:
              Boolean(rentalInfo.available),

            rentPricePerDay:
              rentalInfo.pricePerDay != null &&
                rentalInfo.pricePerDay > 0n
                ? ethers.formatEther(
                  rentalInfo.pricePerDay
                )
                : "0",
          };

          console.log(
            "Loaded teacher:",
            teacher
          );

          teachersData.push(
            teacher
          );
        } catch (error) {
          console.error(
            `Skipping token ${tokenId}:`,
            error
          );
        }
      }

      // =================================================
      // FINISHED
      // =================================================

      console.log(
        "===================================="
      );

      console.log(
        "========== TEACHERS LOADED =========="
      );

      console.log(
        teachersData
      );

      console.log(
        "===================================="
      );

      setTeachers(
        teachersData
      );

      // Save for SubjectPage
      try {
        localStorage.setItem(
          "teachers",
          JSON.stringify(
            teachersData
          )
        );
      } catch (storageError) {
        console.log(
          "Could not save teachers to localStorage:",
          storageError
        );
      }
    } catch (error) {
      console.error(
        "Error loading teachers:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // GROUP SUBJECTS
  // =====================================================

  const groupedSubjects =
    groupBySubject(teachers);

  // =====================================================
  // SUBJECT LIST
  // =====================================================

  const subjects = [
    "All",
    ...Object.keys(
      groupedSubjects
    ),
  ];

  // =====================================================
  // FILTER TEACHERS
  // =====================================================

  const filteredTeachers =
    teachers.filter((teacher) => {
      const name =
        teacher.name || "";

      const subject =
        teacher.subject || "";

      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        name
          .toLowerCase()
          .includes(search);

      const matchesSubject =
        selectedSubject === "All" ||
        subject === selectedSubject;

      return (
        matchesSearch &&
        matchesSubject
      );
    });

  // =====================================================
  // SORT TEACHERS
  // =====================================================

  const sortedTeachers = [
    ...filteredTeachers,
  ];

  switch (sortBy) {
    case "name-asc":
      sortedTeachers.sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );
      break;

    case "name-desc":
      sortedTeachers.sort(
        (a, b) =>
          b.name.localeCompare(
            a.name
          )
      );
      break;

    case "oldest":
      sortedTeachers.sort(
        (a, b) =>
          a.tokenId - b.tokenId
      );
      break;

    case "newest":
    default:
      sortedTeachers.sort(
        (a, b) =>
          b.tokenId - a.tokenId
      );
      break;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      {/* =================================================
          HERO
      ================================================= */}

      <div className="hero">
        <h1>
          🎓 AI Teacher NFT Marketplace
        </h1>

        <p>
          Create, manage and explore AI Teacher NFTs
        </p>
      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="filters">

        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search teachers..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
        />

        {/* SUBJECT */}

        <select
          value={selectedSubject}
          onChange={(e) =>
            setSelectedSubject(
              e.target.value
            )
          }
        >
          {subjects.map(
            (subject) => (
              <option
                key={subject}
                value={subject}
              >
                {subject}
              </option>
            )
          )}
        </select>

        {/* SORT */}

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value
            )
          }
        >
          <option value="newest">
            Newest
          </option>

          <option value="oldest">
            Oldest
          </option>

          <option value="name-asc">
            Name A-Z
          </option>

          <option value="name-desc">
            Name Z-A
          </option>
        </select>

      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div className="loading">
          <p>
            Loading AI Teachers...
          </p>
        </div>
      ) : null}

      {/* =================================================
          SUBJECT SECTION
      ================================================= */}

      {!loading &&
        Object.keys(
          groupedSubjects
        ).length > 0 && (
          <div className="subject-grid">

            {Object.keys(
              groupedSubjects
            ).map((subject) => (

              <div
                key={subject}
                className="subject-card"
              >

                <h2>
                  {subject}
                </h2>

                <p>
                  {
                    groupedSubjects[
                      subject
                    ].length
                  }{" "}
                  Teachers
                </p>

                <Link
                  to={`/subject/${encodeURIComponent(
                    subject
                  )}`}
                >
                  <button>
                    Explore
                  </button>
                </Link>

              </div>

            ))}

          </div>
        )}

      {/* =================================================
          TEACHER SECTION
      ================================================= */}

      {!loading &&
        sortedTeachers.length === 0 ? (

        <p>
          No AI Teachers found.
        </p>

      ) : (

        !loading && (
          <div className="teacher-grid">

            {sortedTeachers.map(
              (teacher) => (

                <TeacherCard
                  key={teacher.tokenId}
                  teacher={teacher}
                />

              )
            )}

          </div>
        )

      )}
    </>
  );
}

export default Home;