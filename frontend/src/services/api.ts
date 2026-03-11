import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
});


// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// ============================
// 🔐 AUTH APIs
// ============================

export const loginUser = async (email: string, password: string) => {
  const params = new URLSearchParams();

  // FastAPI expects "username", not "email"
  params.append("username", email);
  params.append("password", password);

  const response = await API.post("/auth/login", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  return response.data;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await API.post("/auth/register", {
    name,
    email,
    password
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await API.get("/auth/m");
  return response.data;
};


// ============================
// 📋 ASSESSMENT APIs
// ============================

export const getQuestionnaire = async () => {
  const response = await API.get("/assessment/questionnaire");
  return response.data;
};

export const submitAssessment = async (data: any) => {
  const response = await API.post("/assessment/submit", data);
  return response.data;
};

export const getAssessmentHistory = async () => {
  const response = await API.get("/assessment/history");
  return response.data;
};

export const getLatestResult = async () => {
  const response = await API.get("/assessment/dashboard");
  return response.data;
};