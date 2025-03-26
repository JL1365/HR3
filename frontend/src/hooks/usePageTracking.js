import { useEffect } from "react";
import axios from "axios";

const AUTH_URL = process.env.NODE_ENV === "development" 
  ? "http://localhost:7687/api/auth" 
  : "https://backend-hr3.jjm-manufacturing.com/api/auth";

const usePageTracking = (pageName) => {
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const entryTime = Date.now();

    const logPageVisit = async (exitTime) => {
      try {
        const durationMs = exitTime - entryTime;
        const durationSeconds = (durationMs / 1000).toFixed(2);

        await axios.post(
          `${AUTH_URL}/log-page-visit`, 
          { pageName, duration: durationSeconds },
          { withCredentials: true } 
        );
      } catch (error) {
        console.error("Error logging page visit:", error);
      }
    };

    const handleExit = () => logPageVisit(Date.now());

    window.addEventListener("beforeunload", handleExit);
    return () => {
      logPageVisit(Date.now());
      window.removeEventListener("beforeunload", handleExit);
    };
  }, [pageName]);
};

export default usePageTracking;
