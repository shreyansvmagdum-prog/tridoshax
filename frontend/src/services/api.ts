import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

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