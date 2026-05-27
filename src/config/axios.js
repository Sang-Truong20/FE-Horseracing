import axios from "axios";

const baseUrl = "https://horse-manage-kt3o.vercel.app"; 

const config = {
  baseURL: baseUrl,
  timeout: 30000,
};

const api = axios.create(config);

const handleBefore = (config) => {
  const token = localStorage.getItem("token")?.replaceAll('"', "");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
};

const handleError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // window.location.href = "/login"; 
  }
  return Promise.reject(error);
};

api.interceptors.request.use(handleBefore, (error) => Promise.reject(error));
api.interceptors.response.use((response) => response, handleError);

export default api;