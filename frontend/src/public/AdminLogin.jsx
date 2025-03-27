import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import jjmLogo from "../assets/jjmlogo.jpg";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const adminLogin = useAuthStore((state) => state.adminLogin);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await adminLogin({ email, password });
        if (result.success) {
            console.log("Login successful, redirecting...");
            navigate("/employee-dashboard");
        } else {
            setError(result.message || "Invalid email or password.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-500 bg-green-100 bg-opacity-25">
            <div className="bg-white rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.25)] p-10 w-full max-w-sm">
                <div className="flex justify-center gap-x-2 pb-2">
                    <img
                        src={jjmLogo}
                        alt="Logo"
                        className="w-12 h-12 rounded-full border-2"
                    />
                    <h2 className="text-3xl font-bold text-center text-gray-800 mt-1">
                        LOGIN
                    </h2>
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm mb-2">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input input-bordered w-full p-3 border border-gray-300 dark:bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                            required
                        />
                    </div>

                    <div className="mb-6 relative">
                        <div className="flex">
                            <label className="block text-gray-700 text-sm mb-2">
                                Password
                            </label>
                        </div>
                        <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-green-500">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input input-bordered w-full p-3 rounded focus:outline-none dark:bg-white"
                                required
                            />
                            <button
                                type="button"
                                className="flex items-center justify-center w-10 h-full"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <FontAwesomeIcon
                                        icon={faEyeSlash}
                                        className="h-5 w-5 text-gray-500"
                                    />
                                ) : (
                                    <FontAwesomeIcon
                                        icon={faEye}
                                        className="h-5 w-5 text-gray-500"
                                    />
                                )}
                            </button>
                        </div>
                    </div>

                    <button className="btn btn-primary w-full bg-green-600 text-white hover:bg-green-700 py-3 rounded transition duration-200">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;