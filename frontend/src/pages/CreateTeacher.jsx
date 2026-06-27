import TeacherForm from "../components/TeacherForm";
import { useWallet } from "../context/WalletContext";

function CreateTeacher() {
  const { walletAddress } = useWallet();

  return (
    <div className="container">
      <h1>Create AI Teacher</h1>

      {walletAddress ? (
        <>
          <p>Connected: {walletAddress}</p>
          <TeacherForm />
        </>
      ) : (
        <p>Please connect MetaMask first.</p>
      )}
    </div>
  );
}

export default CreateTeacher;