import { useEffect, useState } from "react";
import TeacherCard from "../components/TeacherCard";
import { ethers } from "ethers";
import abi from "../contracts/AITeacherNFT.json";
import { CONTRACT_ADDRESS } from "../contracts/config";

function Home() {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      if (!window.ethereum) return;

      const provider =
        new ethers.BrowserProvider(window.ethereum);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
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

      for (let i = 0; i < totalSupply; i++) {
        console.log("Loading token:", i);

        const [info, market, stats] =
          await contract.getTeacher(i);

        console.log("Info:", info);
        console.log("Market:", market);
        console.log("Stats:", stats);

        const tokenURI =
          await contract.tokenURI(i);

        console.log("Token URI:", tokenURI);


        let metadata = {};

        try {
          metadata = await fetch(tokenURI).then(
            (res) => res.json()
          );
        } catch (err) {
          console.error(
            "Metadata load failed:",
            tokenURI
          );

          metadata = {
            image: "",
            description: "",
          };
        }

        const owner =
          await contract.teacherOwner(i);

        teachersData.push({
          id: i,

          name: info.name,
          subject: info.subject,
          topic: info.topic,
          specialization: info.specialization,

          experience: Number(stats.experience),
          level: Number(stats.level),

          price: ethers.formatEther(market.price),
          forSale: market.forSale,

          rentPricePerDay: ethers.formatEther(
            market.rentPricePerDay
          ),
          forRent: market.forRent,

          imageUrl: metadata.image,
          description: metadata.description,

          ownerWallet: owner,
        });
      }

      console.log(
        "Teachers Data:",
        teachersData
      );

      setTeachers(teachersData);
    } catch (error) {
      console.error(
        "Error loading teachers:",
        error
      );
    }
  };

  const subjects = [
    "All",
    ...new Set(
      teachers.map((teacher) => teacher.subject?.trim())
    ),
  ];

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = teacher.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesSubject =
      selectedSubject === "All" ||
      teacher.subject?.trim() === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  const sortedTeachers = [...filteredTeachers];

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
      sortedTeachers.sort((a, b) => a.id - b.id);
      break;

    default:
      sortedTeachers.sort((a, b) => b.id - a.id);
  }

  const totalTeachers = teachers.length;

  const mathTeachers = teachers.filter(
    (teacher) =>
      teacher.subject?.trim().toLowerCase() ===
      "mathematics"
  ).length;

  const scienceTeachers = teachers.filter(
    (teacher) =>
      teacher.subject?.trim().toLowerCase() ===
      "science"
  ).length;

  const englishTeachers = teachers.filter(
    (teacher) =>
      teacher.subject?.trim().toLowerCase() ===
      "english"
  ).length;
  const artandcraftTeachers = teachers.filter(
    (teacher) =>
      teacher.subject?.trim().toLowerCase() ===
      "art"
  ).length;
  const aiTeachers = teachers.filter(
    (teacher) =>
      teacher.subject?.trim().toLowerCase() ===
      "ai"
  ).length;
  const ictTeachers = teachers.filter(
    (teacher) =>
      teacher.subject?.trim().toLowerCase() ===
      "ict"
  ).length;




  return (
    <>
      <div className="hero">
        <h1>🎓 AI Teacher NFT Marketplace</h1>
        <p>
          Create, manage and explore AI Teacher NFTs
        </p>
      </div>

      <div className="stats-dashboard">
        <h2>Teacher Statistics</h2>

        <p>Total Teachers: {totalTeachers}</p>
        <p>Mathematics: {mathTeachers}</p>
        <p>Science: {scienceTeachers}</p>
        <p>English: {englishTeachers}</p>
        <p>Art and Craft: {artandcraftTeachers}</p>
        <p>AI: {aiTeachers}</p>
        <p>ICT: {ictTeachers}</p>
      </div>

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
            setSelectedSubject(e.target.value)
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
          {sortedTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default Home;