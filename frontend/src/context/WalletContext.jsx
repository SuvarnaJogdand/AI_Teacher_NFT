import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const network = await provider.getNetwork();

      setWalletAddress(accounts[0]);
      setSigner(signer);
      setProvider(provider);
      setChainId(Number(network.chainId));
      localStorage.removeItem("walletDisconnected");

      await switchToAmoy();
    } catch (error) {
      console.error(error);
    }
  };

  const switchToAmoy = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13882" }], // 80002
      });
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x13882",
              chainName: "Polygon Amoy",
              nativeCurrency: {
                name: "POL",
                symbol: "POL",
                decimals: 18,
              },
              rpcUrls: ["https://rpc-amoy.polygon.technology"],
              blockExplorerUrls: [
                "https://amoy.polygonscan.com/",
              ],
            },
          ],
        });
      }
    }
  };

 const disconnectWallet = () => {
  localStorage.setItem(
    "walletDisconnected",
    "true"
  );

  setWalletAddress("");
  setSigner(null);
  setProvider(null);
  setChainId(null);
};

 const checkConnection = async () => {
  if (
    localStorage.getItem(
      "walletDisconnected"
    ) === "true"
  ) {
    return;
  }
    if (!window.ethereum) return;

    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (accounts.length > 0) {
      const provider = new ethers.BrowserProvider(
        window.ethereum
      );

      const signer = await provider.getSigner();

      const network = await provider.getNetwork();

      setWalletAddress(accounts[0]);
      setSigner(signer);
      setProvider(provider);
      setChainId(Number(network.chainId));
    }
  };

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
  if (accounts.length > 0) {
    const provider =
      new ethers.BrowserProvider(
        window.ethereum
      );

    const signer =
      await provider.getSigner();

    setWalletAddress(
      accounts[0]
    );

    setSigner(signer);
    setProvider(provider);

  } else {
    disconnectWallet();
  }
});

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
  walletAddress,
  signer,
  provider,
  connectWallet,
  disconnectWallet,
}}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);