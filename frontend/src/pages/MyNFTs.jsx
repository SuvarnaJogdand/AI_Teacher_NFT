import { useEffect, useState } from "react";
import { ethers } from "ethers";

import TeacherCard from "../components/TeacherCard";
import { useWallet } from "../context/WalletContext";

import abi from "../contracts/AITeacherNFT.json";
import { NFT_CONTRACT } from "../contracts/config";

function MyNFTs() {
  const { signer, walletAddress } = useWallet();

  const [myNFTs, setMyNFTs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (signer && walletAddress) {
      loadNFTs();
    } else {
      setMyNFTs([]);
      setLoading(false);
    }
  }, [walletAddress, signer]);

  const loadNFTs = async () => {
    try {
      setLoading(true);

      console.log("=================================");
      console.log("Loading My NFTs");
      console.log("Wallet:", walletAddress);

      if (!walletAddress || !signer) {
        setMyNFTs([]);
        return;
      }

      const contract = new ethers.Contract(
        NFT_CONTRACT,
        abi.abi,
        signer
      );

      // Use the function used elsewhere in your project
      const totalSupplyBN =
        await contract.getTotalSupply();

      const totalSupply =
        Number(totalSupplyBN);

      console.log("Total NFT supply:", totalSupply);

      const teachers = [];

      // Token IDs in your project start from 1
      for (
        let tokenId = 1;
        tokenId <= totalSupply;
        tokenId++
      ) {
        try {
          console.log(
            `Checking ownership of token ${tokenId}`
          );

          // Check REAL ERC721 ownership
          const owner =
            await contract.ownerOf(tokenId);

          console.log(
            `Token ${tokenId} owner:`,
            owner
          );

          // Compare addresses safely
          if (
            owner.toLowerCase() !==
            walletAddress.toLowerCase()
          ) {
            continue;
          }

          console.log(
            `Token ${tokenId} belongs to current wallet`
          );

          const teacher =
            await contract.getTeacher(tokenId);

          console.log("Teacher:", teacher);

          console.log("Teacher:", teacher);

          const price =
            teacher.mintPrice != null
              ? ethers.formatEther(teacher.mintPrice)
              : "0";

          teachers.push({
            id: tokenId,
            tokenId: tokenId,

            name: teacher.name,
            subject: teacher.subject,
            specialization: teacher.specialization,

            experience: teacher.specialization,
            level: 0,

            price:
              teacher.mintPrice != null
                ? ethers.formatEther(teacher.mintPrice)
                : "0",

            forSale: false,
            rentPricePerDay: "0",
            forRent: false,




          });
        } catch (error) {
          console.log(
            `Skipping token ${tokenId}:`,
            error
          );
        }
      }

      console.log(
        "My owned NFTs:",
        teachers
      );

      setMyNFTs(teachers);
    } catch (error) {
      console.error(
        "Error loading My NFTs:",
        error
      );

      setMyNFTs([]);
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="container">
        <div className="page-title">
          <h1>🎓 My AI Teacher NFTs</h1>
          <p>Please connect MetaMask.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-title">
        <h1>🎓 My AI Teacher NFTs</h1>

        <p>
          View and manage your AI Teacher NFT collection
        </p>
      </div>

      {loading ? (
        <div className="loading">
          <p>Loading NFTs...</p>
        </div>
      ) : myNFTs.length === 0 ? (
        <div className="empty-state">
          <h2>No NFTs Found</h2>
          <p>
            You don't currently own any AI Teacher NFTs.
          </p>
        </div>
      ) : (
        <div className="nft-grid">
          {myNFTs.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyNFTs;