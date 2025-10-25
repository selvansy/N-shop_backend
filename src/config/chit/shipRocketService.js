import axios from "axios";
import config from "./env.js";

// Create an Axios instance
const api = axios.create({
  baseURL: config.SHIPROCKETAPI, 
  headers: {
    "Content-Type": "application/json",
  },
});

// API call wrapper
export const shipRocketApi = async (method, url, data = {}, config = {}) => {
  try {
  if (url === "auth/login") {
    return { token: "mock-dev-token" };
  }
    const response = await api({
      method,
      url,
      data,
      ...config,
    });
    return response.data; // only return useful data
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong!" };
  }
};
