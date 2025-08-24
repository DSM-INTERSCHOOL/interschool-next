import axios from "axios";

const communicationApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_COMMUNICATION_URL || "http://localhost:8000/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default communicationApi;

