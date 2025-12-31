import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8080/api",
});

http.interceptors.request.use((config) => {
  // ưu tiên token bạn đang lưu (localStorage / sessionStorage)
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default http;
