import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

function AdminLogin () {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
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
        <div>
            <form onSubmit={handleSubmit}>
                <h1>Admin Login</h1>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default AdminLogin;