import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import abi from "../contracts/AITeacherNFT.json";
import { NFT_CONTRACT } from "../contracts/config";
import { getSubscriptionContract, } from "../contracts/contracts";
import { uploadImageToIPFS, uploadMetadataToIPFS, } from "../utils/pinata";

function TeacherForm({ existingTeacher = null }) {
  const { walletAddress, signer } = useWallet();
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [yearlyPrice, setYearlyPrice] = useState("");

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
    console.log(
      "PINATA JWT:",
      import.meta.env.VITE_PINATA_JWT
    );
  }, []);


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

    const imageUrl =
      await uploadImageToIPFS(imageFile);

    const metadataURI =
      await uploadMetadataToIPFS(
        teacher,
        imageUrl
      );

    console.log("Image URL:", imageUrl);
    console.log("Metadata URI:", metadataURI);

    try {
      const contract = new ethers.Contract(
        NFT_CONTRACT,
        abi.abi,
        signer
      );

      console.log("Contract address:", NFT_CONTRACT);
      console.log("getTotalSupply:", contract.getTotalSupply);

      //console.log(contract);
      console.log("Address:", NFT_CONTRACT);
      console.log("getTotalSupply exists:", typeof contract.getTotalSupply);



      // const imageUrl =
      //   await uploadImageToIPFS(imageFile);

      // const metadataURI =
      //   await uploadMetadataToIPFS(
      //     teacher,
      //     imageUrl
      //   );



      console.log("Image URL:", imageUrl);

      console.log("Minting NFT...");
      console.log("Name:", teacher.name);
      console.log("Subject:", teacher.subject);
      console.log("Description:", teacher.description);
      console.log("Experience:", teacher.experience);
      console.log("Metadata URI:", metadataURI);


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

      const receipt = await tx.wait();

      console.log("Receipt:", receipt);
      console.log("Logs:", receipt.logs);

      // Print every log
      receipt.logs.forEach((log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          console.log("Parsed Log:", parsed);
        } catch (e) {
          console.log("Unknown Log:", log);
        }
      });

      // Find TeacherMinted event
      const mintEvent = receipt.logs.find((log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === "TeacherMinted";
        } catch {
          return false;
        }
      });

      if (!mintEvent) {
        alert("TeacherMinted event not found.");
        return;
      }

      const parsed = contract.interface.parseLog(mintEvent);

      const tokenId = Number(parsed.args.tokenId);

      console.log("Minted TokenId:", tokenId);

      console.log("Minted TokenId:", tokenId);

      //     const tokenURI =
      // await contract.tokenURI(tokenId);

      // Set subscription prices

      const subscriptionContract =
        await getSubscriptionContract();

      const subTx =
        await subscriptionContract.setSubscriptionPrice(
          tokenId,
          ethers.parseEther(monthlyPrice || "0"),
          ethers.parseEther(yearlyPrice || "0")
        );

      await subTx.wait();

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

      <input
        type="number"
        placeholder="Monthly Subscription Price (POL)"
        value={monthlyPrice}
        onChange={(e) =>
          setMonthlyPrice(e.target.value)
        }
      />

      <input
        type="number"
        placeholder="Yearly Subscription Price (POL)"
        value={yearlyPrice}
        onChange={(e) =>
          setYearlyPrice(e.target.value)
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