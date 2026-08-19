import { Link } from "react-router-dom";
import WalletButton from "./WalletButton";


function Navbar() {
  return (
    <nav className="navbar">
      <h2>🎓 AI Teacher NFT</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>

        <Link to="/create">
          Create Teacher
        </Link>

        <Link to="/my-nfts">
          My NFTs
        </Link>

        <Link to="/my-subscriptions">
          My Subscriptions
        </Link>

        <Link to="/my-rentals">
          My Rentals
        </Link>

        <Link to="/teacher-dashboard">
            Teacher Dashboard
        </Link>
      </div>

      <WalletButton />
    </nav>
  );
}

export default Navbar;