import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon as FaEye, FontAwesomeIcon as FaEyeSlash } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import jjmLogo from "../assets/jjmlogo.jpg";
function EmployeeLogin() {
    const [formData, setFormData] = useState({ employee_email: "", employee_password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const employeeLogin = useAuthStore((state) => state.employeeLogin);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await employeeLogin({ email: formData.employee_email, password: formData.employee_password });
        setLoading(false);
        if (result.success) {
            navigate("/employee-dashboard");
        } else {
            setError(result.message || "Invalid email or password.");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-opacity-15 px-4">
            {loading && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-sm">Loading...</div>}
            <div className="p-6 py-10 w-full max-w-xs h-auto bg-white shadow-lg rounded-lg border">
                <div className="flex justify-center gap-x-2 pb-2">
                    <img
                        src={jjmLogo}
                        alt="Logo"
                        className="w-12 h-12 rounded-full border-2"
                    />
                    <h2 className="text-2xl font-bold text-center text-gray-800 mt-1">
                        LOGIN
                    </h2>
                </div>

                {error && (
                    <p className="text-red-500 text-xs text-center mb-2">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label
                            htmlFor="employee_email"
                            className="block text-xs py-2 font-medium text-gray-600"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            name="employee_email"
                            id="employee_email"
                            value={formData.employee_email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label
                            htmlFor="employee_password"
                            className="block text-xs font-medium text-gray-600 py-2"
                        >
                            Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="employee_password"
                            id="employee_password"
                            value={formData.employee_password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 text-sm"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 mt-8 pr-3 flex items-center text-gray-600"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <FaEye icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-3 w-3 text-black focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="rememberMe"
                            className="ml-2 block text-xs text-gray-900"
                        >
                            Remember me
                        </label>
                    </div>

                    <div className="text-right">
                        <Link
                            to="/forgot-password"
                            className="text-xs text-blue-600 hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-md transition-colors flex items-center justify-center"
                    >
                        Login
                    </button>
                </form>
            </div>

            <div className="fixed bottom-0 text-center w-full bg-white p-4 shadow-md">
                <span className="text-xs">All right reserved 2025</span>
            </div>
        </div>
    );
}

export default EmployeeLogin;
