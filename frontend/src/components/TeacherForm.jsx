import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import abi from "../contracts/AITeacherNFT.json";
import { CONTRACT_ADDRESS } from "../contracts/config";
import { uploadImageToIPFS, uploadMetadataToIPFS,} from "../utils/ipfs";

function TeacherForm({ existingTeacher = null }) {
  const { walletAddress, signer } = useWallet();

  const [teacher, setTeacher] = useState({
    name: "",
    subject: "",
    description: "",
    experience: "",
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [price, setPrice] = useState("");


  useEffect(() => {
    if (existingTeacher) {
      setTeacher({
        name: existingTeacher.name || "",
        subject: existingTeacher.subject || "",
        description: existingTeacher.description || "",
        experience: existingTeacher.experience || "",
      });

      setPreviewUrl(existingTeacher.imageUrl || "");
    }
  }, [existingTeacher]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTeacher((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };

    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletAddress) {
      alert("Please connect MetaMask");
      return;
    }

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi.abi,
        signer
      );

      

      const imageUrl =
         await uploadImageToIPFS(imageFile);

      const metadataURI =
           await uploadMetadataToIPFS(
           teacher,
           imageUrl
  );

  

  if (!price || Number(price) < 0.0001) {
  alert("Minimum NFT price is 0.0001 POL");
  return;
}

const tx = await contract.mintTeacher(
  walletAddress,
  teacher.name,
  teacher.subject,
  teacher.description,
  teacher.experience,
  metadataURI,
  ethers.parseEther(price.toString())
);

alert("Waiting for confirmation...");

await tx.wait();

      // const teacherData = {
      //   id: Date.now(),
      //   name: teacher.name,
      //   subject: teacher.subject,
      //   description: teacher.description,
      //   experience: teacher.experience,
      //   imageUrl: previewUrl,
      //   ownerWallet: walletAddress,
      //   createdAt: new Date().toISOString(),
      // };

      // const teachers =
      //   JSON.parse(localStorage.getItem("teachers")) || [];

      // teachers.push(teacherData);

      // localStorage.setItem(
      //   "teachers",
      //   JSON.stringify(teachers)
      // );

      await tx.wait();

      alert("AI Teacher NFT Minted!");

      setTeacher({
        name: "",
        subject: "",
        description: "",
        experience: "",
      });

     setPreviewUrl("");
     setPrice("");
    } catch (error) {
      console.error(error);
      alert("Mint failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Teacher Name</label>
        <input
          type="text"
          name="name"
          value={teacher.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Subject</label>
        <input
          type="text"
          name="subject"
          value={teacher.subject}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={teacher.description}
          onChange={handleChange}
          rows="4"
          required
        />
      </div>

      <div>
        <label>Experience</label>
        <input
          type="text"
          name="experience"
          value={teacher.experience}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Teacher Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <input
  type="number"
  placeholder="NFT Price (POL)"
  value={price}
  onChange={(e) =>
    setPrice(e.target.value)
  }
/>

      {previewUrl && (
        <div style={{ marginTop: "15px" }}>
          <img
            src={previewUrl}
            alt="Teacher Preview"
            width="200"
            style={{
              borderRadius: "10px",
            }}
          />
        </div>
      )}

      <button type="submit">
        {existingTeacher
          ? "Update Teacher"
          : "Create Teacher"}
      </button>
    </form>
  );
}

export default TeacherForm;