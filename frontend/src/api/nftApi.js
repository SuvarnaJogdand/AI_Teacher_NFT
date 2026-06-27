import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const uploadImage = (formData) =>
  axios.post(
    `${API_URL}/nft/upload-image`,
    formData
  );

export const uploadMetadata = (data) =>
  axios.post(
    `${API_URL}/nft/upload-metadata`,
    data
  );

export const mintNFT = (data) =>
  axios.post(
    `${API_URL}/nft/mint`,
    data
  );