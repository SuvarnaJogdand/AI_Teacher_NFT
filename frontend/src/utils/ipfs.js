import axios from "axios";

const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZmJhNzI2OC0yOGIwLTQzNzAtYmVlZS04NWFmOGQ3ZWQ4NGUiLCJlbWFpbCI6InN1dmFybmFwYWRtZTZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImYxOWU5MWNhMDJiZjYyMDlhOTE4Iiwic2NvcGVkS2V5U2VjcmV0IjoiYjRiNzRmNmM1NjU3NzU3N2UzYzYzMzZkYmZiZjUxMjE2YTRjMTY5NDFkNzYxM2Y1NGM0NzVlYzkzNmZjZjVkNiIsImV4cCI6MTgxMTQwOTQ4MH0.FdrD1LeWP0rcXrENXVmdd21kCnJvt3B8P6o-OebpZ1E";

export const uploadImageToIPFS = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
    }
  );

  return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
};

export const uploadMetadataToIPFS = async (
  teacher,
  imageUrl
) => {
  const metadata = {
    name: teacher.name,
    description: teacher.description,
    image: imageUrl,

    attributes: [
      {
        trait_type: "Subject",
        value: teacher.subject,
      },
      {
        trait_type: "Experience",
        value: teacher.experience,
      },
    ],
  };

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    metadata,
    {
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
    }
  );

  return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
};