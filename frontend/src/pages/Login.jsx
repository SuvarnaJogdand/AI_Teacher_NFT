import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

function Login() {
  const { walletAddress, connectWallet } =
    useWallet();

  const navigate = useNavigate();

  useEffect(() => {
    if (walletAddress) {
      navigate("/");
    }
  }, [walletAddress, navigate]);

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>🎓 AI Teacher NFT</h1>

        <p>
          Connect your MetaMask wallet to continue
        </p>

        <button onClick={connectWallet}>
          Connect MetaMask
        </button>
      </div>
    </div>
  );
}

export default Login;