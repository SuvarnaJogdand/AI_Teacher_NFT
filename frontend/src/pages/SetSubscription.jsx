import { useState } from "react";
import { ethers } from "ethers";

import abi from "../contracts/AITeacherNFT.json";
import { NFT_CONTRACT } from "../contracts/config";

function SetSubscription({ tokenId }) {

  const [monthly, setMonthly] = useState("");
  const [yearly, setYearly] = useState("");

  const savePrices = async () => {

    const provider =
      new ethers.BrowserProvider(window.ethereum);

    const signer =
      await provider.getSigner();

    const contract = new ethers.Contract(
      NFT_CONTRACT,
      abi.abi,
      signer
    );

    const tx =
      await contract.setSubscriptionPrice(
        tokenId,
        ethers.parseEther(monthly),
        ethers.parseEther(yearly)
      );

    await tx.wait();

    alert("Prices Updated");
  };

  return (
    <div>
      <input
        placeholder="Monthly POL"
        value={monthly}
        onChange={(e) =>
          setMonthly(e.target.value)
        }
      />

      <input
        placeholder="Yearly POL"
        value={yearly}
        onChange={(e) =>
          setYearly(e.target.value)
        }
      />

      <button onClick={savePrices}>
        Save Prices
      </button>
    </div>
  );
}

export default SetSubscription;