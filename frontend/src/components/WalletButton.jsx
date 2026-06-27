import { useWallet } from "../context/WalletContext";

function WalletButton() {
  const {
    walletAddress,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  return (
    <>
      {walletAddress ? (
        <>
          <span>
            {walletAddress.slice(0, 6)}...
            {walletAddress.slice(-4)}
          </span>

          <button onClick={disconnectWallet}>
            Disconnect
          </button>
        </>
      ) : (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </>
  );
}

export default WalletButton;