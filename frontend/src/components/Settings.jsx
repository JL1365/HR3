import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { axiosInstance } from "../lib/axios";

function Settings() {
    const { user, getMyProfileInfo } = useAuthStore();
    const [enableMFA, setEnableMFA] = useState(user?.multiFactorEnabled || false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleToggleMFA = async () => {
        setLoading(true);
        setMessage("");
        try {
            const response = await axiosInstance.post("/auth/toggle-mfa", { enableMFA: !enableMFA });
            setEnableMFA(!enableMFA);
            setMessage(response.data.message);
            await getMyProfileInfo(); // Refresh user data
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to toggle MFA");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Settings</h1>
            <div>
                <h2>Multi-Factor Authentication</h2>
                <p>Enhance your account security by enabling multi-factor authentication.</p>
                <label>
                    <input
                        type="checkbox"
                        checked={enableMFA}
                        onChange={handleToggleMFA}
                        disabled={loading}
                    />
                    {loading ? "Processing..." : enableMFA ? "Enabled" : "Disabled"}
                </label>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default Settings;