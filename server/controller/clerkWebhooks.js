import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        console.log("🔔 Clerk Webhook Triggered");

        const payload = req.body; // raw buffer
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const evt = wh.verify(payload, headers); // returns parsed JSON with type/data

        const { data, type } = evt;

        const userData = {
            _id: data.id,
            username: `${data.firstName || ''} ${data.lastName || ''}`.trim() || "Unnamed User",
            email: data.emailAddresses?.[0]?.emailAddress || "no-email@provided.com",
            image: data.imageUrl || "",
            role: "user",
            recentSearchedCities: [],
        };

        console.log("🚀 Processed User Data: ", userData);

        switch (type) {
            case "user.created":
                await User.create(userData);
                console.log("✅ User Created in DB");
                break;
            case "user.updated":
                await User.findByIdAndUpdate(data.id, userData);
                console.log("✅ User Updated in DB");
                break;
            case "user.deleted":
                await User.findByIdAndDelete(data.id);
                console.log("✅ User Deleted from DB");
                break;
            default:
                console.log("⚠️ Unknown Webhook Event");
                break;
        }

        res.json({ success: true, message: "Webhook Received" });
    } catch (error) {
        console.error("❌ Webhook Error: ", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export default clerkWebhooks;
