import axios from "axios";

const API = axios.create({
  baseURL: "https://satellite-constellation-system.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const simulateStep = async () => {
  try {
    const res = await API.post("/simulate/step");
    return res.data;
  } catch (error) {
    console.error("simulateStep error:", error);
    return null;
  }
};

export const getSnapshot = async () => {
  try {
    const res = await API.get("/visualization/snapshot");

    console.log("SNAPSHOT DATA:", res.data);

    return res.data;
  } catch (err) {
    console.error("API ERROR:", err);

    return null;
  }
};

export const scheduleManeuver = async (payload) => {
  try {
    const res = await API.post("/maneuver/schedule", payload);
    return res.data;
  } catch (error) {
    console.error("scheduleManeuver error:", error);
    return null;
  }
};

export const getSystemStatus = async () => {
  try {
    const res = await API.get("/health");
    return res.data;
  } catch (error) {
    console.error("system status error:", error);
    return null;
  }
};
