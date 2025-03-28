import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";

function VerifyOtp() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance.post("/auth/verify-otp", { email, otp });
            setLoading(false);
            if (response.data.token) {
                navigate("/employee-dashboard");
            }
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || "Failed to verify OTP.");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="p-6 py-10 w-full max-w-xs h-auto bg-white shadow-lg rounded-lg border">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Verify OTP</h2>
                {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-xs font-medium text-gray-600"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="otp"
                            className="block text-xs font-medium text-gray-600"
                        >
                            OTP
                        </label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-md transition-transform duration-200 transform hover:scale-105"
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default VerifyOtp;