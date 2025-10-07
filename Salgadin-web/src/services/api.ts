import axios from "axios";

export const api = axios.create({
  baseURL: "https://localhost:5297/api", // IMPORTANTE: Verifique a porta do seu backend!
});
