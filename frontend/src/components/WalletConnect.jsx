import { useState } from "react";
import { BrowserProvider } from "ethers";

function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      const selectedAddress = await signer.getAddress();

      console.log("Selected Account:", selectedAddress);

      setWalletAddress(selectedAddress);

      localStorage.setItem(
        "walletAddress",
        selectedAddress
      );

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {walletAddress ? (
        <p>
          Connected:
          {" "}
          {walletAddress.slice(0, 6)}
          ...
          {walletAddress.slice(-4)}
        </p>
      ) : (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletConnect;