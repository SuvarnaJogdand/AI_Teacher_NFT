import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [accounts, setAccounts] = useState([]);


  console.log("window.ethereum:", window.ethereum);
  console.log("window.ethereum.providers:", window.ethereum.providers);
  const connectWallet = async () => {
    try {
      console.log("Connect clicked");

      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);

      console.log(window.ethereum);
      console.log(await provider.send("eth_accounts", []));

      const signer = await provider.getSigner();

      console.log("Signer:", await signer.getAddress());

      console.log(
        "MetaMask selected:",
        await window.ethereum.request({
          method: "eth_accounts",
        })
      );

      console.log(await signer.getAddress());

      // Debug
      console.log(
        "Signer Address:",
        await signer.getAddress()
      );

      const selectedAddress = await signer.getAddress();

      const network = await provider.getNetwork();

      console.log("Selected Account:", selectedAddress);

      setWalletAddress(selectedAddress);
      setAccounts([selectedAddress]);
      setSigner(signer);
      setProvider(provider);
      setChainId(Number(network.chainId));

      localStorage.removeItem("walletDisconnected");

    } catch (error) {
      console.error(error);
    }
  };
  // const switchToAmoy = async () => {
  //   try {
  //     await window.ethereum.request({
  //       method: "wallet_switchEthereumChain",
  //       params: [{ chainId: "0x13882" }], // 80002
  //     });
  //   } catch (error) {
  //     if (error.code === 4902) {
  //       await window.ethereum.request({
  //         method: "wallet_addEthereumChain",
  //         params: [
  //           {
  //             chainId: "0x13882",
  //             chainName: "Polygon Amoy",
  //             nativeCurrency: {
  //               name: "POL",
  //               symbol: "POL",
  //               decimals: 18,
  //             },
  //             rpcUrls: ["https://rpc-amoy.polygon.technology"],
  //             blockExplorerUrls: [
  //               "https://amoy.polygonscan.com/",
  //             ],
  //           },
  //         ],
  //       });
  //     }
  //   }
  // };

  const switchAccount = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      // Ask MetaMask to let the user choose/confirm the account
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const selectedAddress = await signer.getAddress();

      const network = await provider.getNetwork();

      console.log("Switched Account:", selectedAddress);

      setWalletAddress(selectedAddress);
      setAccounts([selectedAddress]);
      setSigner(signer);
      setProvider(provider);
      setChainId(Number(network.chainId));

    } catch (error) {
      console.error(error);
    }
  };
  const disconnectWallet = () => {
    localStorage.setItem(
      "walletDisconnected",
      "true"
    );

    setWalletAddress("");
    setAccounts([]);
    setSigner(null);
    setProvider(null);
    setChainId(null);
  };

  const checkConnection = async () => {
    try {
      if (
        localStorage.getItem("walletDisconnected") === "true"
      ) {
        return;
      }

      if (!window.ethereum) return;

      const connectedAccounts =
        await window.ethereum.request({
          method: "eth_accounts",
        });

      if (connectedAccounts.length === 0) {
        return;
      }

      const provider =
        new ethers.BrowserProvider(window.ethereum);

      const signer =
        await provider.getSigner();

      const selectedAddress =
        await signer.getAddress();

      const network =
        await provider.getNetwork();

      console.log(
        "Auto-connected wallet:",
        selectedAddress
      );

      setAccounts([selectedAddress]);
      setWalletAddress(selectedAddress);
      setSigner(signer);
      setProvider(provider);
      setChainId(Number(network.chainId));

    } catch (error) {
      console.error(
        "Error checking wallet connection:",
        error
      );
    }
  };

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);

          const signer = await provider.getSigner();

          const selectedAddress = await signer.getAddress();

          console.log("MetaMask switched to:", selectedAddress);

          setAccounts([selectedAddress]);
          setWalletAddress(selectedAddress);
          setSigner(signer);
          setProvider(provider);

          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));

        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  console.log("Current walletAddress:", walletAddress);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        signer,
        provider,
        connectWallet,
        disconnectWallet,
        switchAccount,
        accounts,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);