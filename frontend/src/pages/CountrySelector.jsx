import { useState } from "react";

function CountrySelector() {
  const [country, setCountry] =
    useState("India");

  const saveCountry = async () => {
    const walletAddress =
      localStorage.getItem("wallet");

    await fetch(
      "http://localhost:5000/api/save-country",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          country,
        }),
      }
    );

    alert("Country saved");
  };

  return (
    <>
      <h2>Select Country</h2>

      <select
        value={country}
        onChange={(e) =>
          setCountry(e.target.value)
        }
      >
        <option>India</option>
        <option>USA</option>
        <option>UK</option>
        <option>Canada</option>
        <option>Japan</option>
      </select>

      <button onClick={saveCountry}>
        Save
      </button>
    </>
  );
}

export default CountrySelector;