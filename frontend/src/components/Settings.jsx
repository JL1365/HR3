import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { axiosInstance } from "../lib/axios";

function Settings() {
    const { user, getMyMFAStatus, getMyProfileInfo } = useAuthStore();
    const [enableMFA, setEnableMFA] = useState(user?.multiFactorEnabled || false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchMFAStatus = async () => {
            const result = await getMyMFAStatus();
            if (result.success) {
                setEnableMFA(result.multiFactorEnabled);
            }
        };
        fetchMFAStatus();
    }, [getMyMFAStatus]);

    const handleToggleMFA = async () => {
        setLoading(true);
        setMessage("");
        try {
            const response = await axiosInstance.post("/auth/toggle-mfa", { enableMFA: !enableMFA });
            await getMyProfileInfo(); // Refresh user data to ensure consistency
            setEnableMFA(response.data.mfaRecord.multiFactorEnabled); // Set the state based on backend response
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to toggle MFA");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-base-200 min-h-screen">
            <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold">Multi-Factor Authentication</h2>
                    <p className="text-gray-600 mt-2">
                        Enhance your account security by enabling multi-factor authentication.
                    </p>
                    <p className="mt-4">
                        <strong>Status:</strong>{" "}
                        <span className={`badge ${enableMFA ? "badge-success" : "badge-error"}`}>
                            {enableMFA ? "Enabled" : "Disabled"}
                        </span>
                    </p>
                    <button
                        onClick={handleToggleMFA}
                        disabled={loading}
                        className={`btn mt-4 ${enableMFA ? "btn-error" : "btn-primary"} ${
                            loading ? "btn-disabled" : ""
                        }`}
                    >
                        {loading ? (
                            <span className="loading loading-spinner"></span>
                        ) : enableMFA ? (
                            "Disable MFA"
                        ) : (
                            "Enable MFA"
                        )}
                    </button>
                    {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
                </div>
            </div>
        </div>
    );
}

export default Settings;