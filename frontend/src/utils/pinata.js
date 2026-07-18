console.log(
  "PINATA JWT:",
  import.meta.env.VITE_PINATA_JWT
);

export async function uploadImageToIPFS(file) {
  const data = new FormData();
  data.append("file", file);

  const res = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
      },
      body: data,
    }
  );

  console.log("Response Status:", res.status);

  const result = await res.json();

  console.log("Pinata Result:", result);

  if (!res.ok) {
    throw new Error(
      result.error || JSON.stringify(result)
    );
  }

  return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
}

export async function uploadMetadataToIPFS(
  teacher,
  imageUrl
) {
  const metadata = {
    name: teacher.name,
    description: teacher.description,
    image: imageUrl,
    subject: teacher.subject,
    experience: teacher.experience,
  };

  const res = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
      },
      body: JSON.stringify(metadata),
    }
  );

  const result = await res.json();

  return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
}