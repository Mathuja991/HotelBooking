import jwt from 'jsonwebtoken';
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        // Extract token
        const token = authHeader.split(' ')[1];

        // Verify token (use your secret from token generation)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from decoded token
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: "Authentication error" });
    }
};
