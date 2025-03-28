import { useState } from "react";
import { useAuthStore } from "../store/authStore";

function Settings() {
    const { user, toggleMFA } = useAuthStore();
    const [enableMFA, setEnableMFA] = useState(user?.multiFactorEnabled || false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleToggleMFA = async () => {
        setLoading(true);
        setMessage("");
        try {
            const result = await toggleMFA(!enableMFA);
            if (result.success) {
                setEnableMFA(!enableMFA);
            }
            setMessage(result.message);
        } catch (error) {
            setMessage("An unexpected error occurred.");
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