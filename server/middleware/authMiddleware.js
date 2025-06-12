import jwt from 'jsonwebtoken';
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user
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
