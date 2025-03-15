import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", req.user); // Log the decoded token for debugging
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message); // Log the error
        return res.status(403).json({ success: false, message: "Invalid token" });
    }
};

export const serviceVerifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized access" });
    }

    jwt.verify(token, process.env.SERVICE_JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = decoded;
        next();
    });
};
