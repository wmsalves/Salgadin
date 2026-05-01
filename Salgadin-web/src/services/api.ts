import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/+$/, "")
  : "http://localhost:5297/api";

export const api = axios.create({
  baseURL,
});
