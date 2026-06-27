import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getNonce = (walletAddress) =>
  axios.post(`${API_URL}/auth/nonce`, {
    walletAddress,
  });

export const login = (data) =>
  axios.post(`${API_URL}/auth/login`, data);