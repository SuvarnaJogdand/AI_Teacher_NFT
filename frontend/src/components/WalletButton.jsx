import { useWallet } from "../context/WalletContext";

function WalletButton() {
  const {
    walletAddress,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  return (
    <div>
      <p>{walletAddress || "Not Connected"}</p>

      {!walletAddress ? (
        <button
          onClick={() => {
            console.log("Connect Wallet button clicked");
            connectWallet();
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <button onClick={disconnectWallet}>
          Disconnect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletButton;