import { useEffect, useState } from "react";
import { ethers } from "ethers";
import TeacherCard from "../components/TeacherCard";

import abi from "../contracts/AITeacherNFT.json";
import { NFT_CONTRACT } from "../contracts/config";
import { getMarketplaceContract, getRentalContract } from "../contracts/contracts";

function Home() {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {

    try {
      if (!window.ethereum) return;


      const provider =
        new ethers.BrowserProvider(window.ethereum);

      const contract = new ethers.Contract(
        NFT_CONTRACT,
        abi.abi,
        provider
      );

      const totalSupply =
        await contract.getTotalSupply();

      console.log(
        "Total Supply:",
        totalSupply.toString()
      );

      const teachersData = [];

      for (
        let tokenId = 1;
        tokenId <= Number(totalSupply);
        tokenId++
      ) {
        try {
          const teacher =
            await contract.getTeacher(tokenId);

          const tokenURI =
            await contract.tokenURI(tokenId);

          console.log("TokenURI:", tokenURI);

          const owner =
            await contract.teacherOwner(tokenId);

          const marketplace =
            await getMarketplaceContract();

          const rental =
            await getRentalContract();

          const listing =
            await marketplace.getListing(tokenId);

          const rentalInfo =
            await rental.getRental(tokenId);

          console.log("Listing:", listing);
          console.log("Rental:", rentalInfo);

          let metadata = {};
          //console.log("TokenURI:", tokenURI);
          try {
            const response = await fetch(tokenURI);

            console.log("Response status:", response.status);

            metadata = await response.json();

            console.log("Metadata:", metadata);
          } catch (err) {
            console.log("Metadata error:", err);
          }

          teachersData.push({
            id: tokenId,
            tokenId,

            name: teacher.name,
            subject: teacher.subject,
            topic: teacher.topic,
            specialization: teacher.specialization,

            mintPrice:
              teacher.mintPrice?.toString() || "0",

            imageUrl: metadata.image || "",
            description: metadata.description || "",

            ownerWallet: owner,

            forSale: listing[1],
            salePrice: listing[0]
              ? ethers.formatEther(listing[0])
              : "0",

            forRent: rentalInfo[1],
            rentPricePerDay: rentalInfo[0]
              ? ethers.formatEther(rentalInfo[0])
              : "0",
          });
        } catch (err) {
          console.log(
            "Skipping token",
            tokenId,
            err.message
          );
        }
      }

      console.log(
        "Teachers Loaded:",
        teachersData
      );

      setTeachers(teachersData);
    } catch (error) {
      console.error(
        "Error loading teachers:",
        error
      );
    }


  }

  const subjects = [
    "All",
    ...new Set(
      teachers.map(
        (teacher) => teacher.subject
      )
    ),
  ];

  const filteredTeachers =
    teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesSubject =
        selectedSubject === "All" ||
        teacher.subject ===
        selectedSubject;

      return (
        matchesSearch &&
        matchesSubject
      );
    });


  const sortedTeachers = [
    ...filteredTeachers,
  ];

  switch (sortBy) {
    case "name-asc":
      sortedTeachers.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      break;


    case "name-desc":
      sortedTeachers.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
      break;

    case "oldest":
      sortedTeachers.sort(
        (a, b) => a.id - b.id
      );
      break;

    default:
      sortedTeachers.sort(
        (a, b) => b.id - a.id
      );


  }

  return (
    <> <div className="hero"> <h1>🎓 AI Teacher NFT Marketplace</h1> <p>
      Create, manage and explore AI Teacher NFTs </p> </div>


      <div className="filters">
        <input
          type="text"
          placeholder="Search Teacher..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <select
          value={selectedSubject}
          onChange={(e) =>
            setSelectedSubject(
              e.target.value
            )
          }
        >
          {subjects.map((subject) => (
            <option
              key={subject}
              value={subject}
            >
              {subject}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="newest">
            Newest First
          </option>

          <option value="oldest">
            Oldest First
          </option>

          <option value="name-asc">
            Name A-Z
          </option>

          <option value="name-desc">
            Name Z-A
          </option>
        </select>
      </div>

      {sortedTeachers.length === 0 ? (
        <p>No AI Teachers found.</p>
      ) : (
        <div className="teacher-grid">
          {sortedTeachers.map(
            (teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
              />
            )
          )}
        </div>
      )}
    </>


  );
}

export default Home;
