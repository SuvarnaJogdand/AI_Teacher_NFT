import { useEffect, useState } from "react";
import { ethers } from "ethers";

import TeacherCard from "../components/TeacherCard";
import { useWallet } from "../context/WalletContext";

import abi from "../contracts/AITeacherNFT.json";
import { CONTRACT_ADDRESS } from "../contracts/config";

function MyNFTs() {
  const { signer, walletAddress } = useWallet();

  const [myNFTs, setMyNFTs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, [walletAddress, signer]);

  const loadNFTs = async () => {
    try {
      if (!walletAddress || !signer) {
        setLoading(false);
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi.abi,
        signer
      );

      const tokenIds =
        await contract.tokensOfOwner(walletAddress);

      const teachers = [];

      for (const tokenId of tokenIds) {

        if (tokenId == null) continue;

        const [info, market, stats] =
          await contract.getTeacher(tokenId);

        teachers.push({
          id: Number(tokenId),

          name: info.name,
          subject: info.subject,
          specialization: info.specialization,

          level: Number(stats.level),
          experience: Number(stats.experience),

          price: ethers.formatEther(market.price),
          forSale: market.forSale,

          rentPricePerDay: ethers.formatEther(
            market.rentPricePerDay
          ),

          forRent: market.forRent,
        });
      }

      setMyNFTs(teachers);
    } catch (error) {
      console.error(error);
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
          <p>Mint your first AI Teacher NFT.</p>
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