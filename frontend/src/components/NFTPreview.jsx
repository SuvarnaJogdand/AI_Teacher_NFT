function NFTPreview({ teacher }) {
  const metadata = {
    name: teacher.name,
    description: teacher.description,
    image: teacher.imageUrl,
    owner: teacher.ownerWallet,
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

  return (
    <div>
      <h3>NFT Metadata</h3>

      <pre>
        {JSON.stringify(metadata, null, 2)}
      </pre>
    </div>
  );
}

export default NFTPreview;