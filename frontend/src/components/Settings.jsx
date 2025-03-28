import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";

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
        <motion.div
            className="p-6 bg-base-200 rounded-lg shadow-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <h2 className="text-lg font-semibold">Multi-Factor Authentication</h2>
                <p className="text-sm text-gray-600">
                    Enhance your account security by enabling multi-factor authentication.
                </p>
                <label className="flex items-center space-x-3">
                    <motion.input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={enableMFA}
                        onChange={handleToggleMFA}
                        disabled={loading}
                        whileTap={{ scale: 0.9 }}
                    />
                    <span className="text-sm">
                        {loading ? "Processing..." : enableMFA ? "Enabled" : "Disabled"}
                    </span>
                </label>
                {message && (
                    <motion.p
                        className="text-sm text-info"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {message}
                    </motion.p>
                )}
            </motion.div>
        </motion.div>
    );
}

export default Settings;