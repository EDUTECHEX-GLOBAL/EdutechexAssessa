// src/api/aiAgentAPI.js
import axios from "axios";

const aiAgentAPI = axios.create({
  baseURL: "https://assessaai.com/api/ai-agent",
});

export default aiAgentAPI;
