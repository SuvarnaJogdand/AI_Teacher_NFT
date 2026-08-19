
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";

import { useWallet } from "../context/WalletContext";
import abi from "../contracts/AITeacherNFT.json";
import { NFT_CONTRACT } from "../contracts/config";

function ManageTeacher() {

  const {
    walletAddress,
    provider
  } = useWallet();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMyTeachers = async () => {

    try {

      setLoading(true);
      setError("");

      if (!walletAddress) {
        setError("Please connect your wallet.");
        return;
      }

      if (!provider) {
        setError("Wallet provider not available.");
        return;
      }

      const contract = new ethers.Contract(
        NFT_CONTRACT,
        abi.abi || abi,
        provider
      );

      console.log(
        "Loading teachers for:",
        walletAddress
      );

      const tokenIds =
        await contract.tokensOfOwner(walletAddress);

      console.log(
        "My Teacher NFT IDs:",
        tokenIds
      );

      const teacherList = [];

      for (const id of tokenIds) {

        try {

          const numericTokenId = Number(id);

          const result =
            await contract.getTeacher(
              numericTokenId
            );

          const info = result[0];
          const market = result[1];
          const stats = result[2];

          teacherList.push({

            tokenId: numericTokenId,

            name: info.name,
            subject: info.subject,
            description: info.description,
            experience: info.experience,
            metadataURI: info.metadataURI,

            mintPrice: ethers.formatEther(
              info.price || 0
            ),

            isForSale:
              market.isForSale,

            salePrice:
              ethers.formatEther(
                market.salePrice || 0
              ),

            isForRent:
              market.isForRent,

            rentPrice:
              ethers.formatEther(
                market.rentPrice || 0
              ),

            totalSales:
              stats.totalSales?.toString() || "0",

            totalRentals:
              stats.totalRentals?.toString() || "0",

            totalRevenue:
              ethers.formatEther(
                stats.totalRevenue || 0
              ),

          });

        } catch (err) {

          console.error(
            `Error loading token ${id}:`,
            err
          );

        }

      }

      setTeachers(teacherList);

    } catch (err) {

      console.error(
        "Manage Teacher error:",
        err
      );

      setError(
        err.reason ||
        err.message ||
        "Failed to load teachers."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    if (walletAddress && provider) {
      loadMyTeachers();
    }

  }, [walletAddress, provider]);



    return (
        <div className="min-h-screen bg-gray-100 p-8">

            <h1 className="text-3xl font-bold text-gray-800">
                Teacher Dashboard
            </h1>

            <p className="mt-3 text-gray-600">
                Welcome to your Teacher Dashboard.
            </p>

            <div className="mt-6 bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">
                    Connected Wallet
                </p>

                <p className="font-mono mt-2 break-all">
                    {walletAddress || "Wallet not connected"}
                </p>
            </div>

        </div>
    );
}

export default ManageTeacher;