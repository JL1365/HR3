import { useState } from "react";
import { useAuthStore } from "../store/authStore";

function EmployeeLogin () {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const employeeLogin = useAuthStore((state) => state.employeeLogin);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await employeeLogin({ email, password });
        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <h1>Employee Login</h1>
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

export default EmployeeLogin;