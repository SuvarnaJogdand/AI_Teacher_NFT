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

      const accounts = await provider.send(
        "eth_requestAccounts",
        []
      );

      setWalletAddress(accounts[0]);

      localStorage.setItem(
        "walletAddress",
        accounts[0]
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