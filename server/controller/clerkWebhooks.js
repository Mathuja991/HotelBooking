import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        console.log("🔔 Clerk Webhook Triggered");

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // req.body is Buffer because we used express.raw()
        const payload = req.body.toString("utf8");

        // Verify the webhook signature and parse the event
        const evt = whook.verify(payload, headers);

        const { data, type } = evt;

        console.log("📦 Webhook Type: ", type);
        console.log("👤 User Data: ", data);

        const userData = {
            _id: data.id,
            username: `${data.first_name || ''} ${data.last_name || ''}`.trim() || "Unnamed User",
            email: data.email_addresses?.[0]?.email_address || "no-email@provided.com",
            image: data.image_url || "",
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

        res.status(200).json({ success: true, message: "Webhook Received" });
    } catch (error) {
        console.error("❌ Webhook Error: ", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export default clerkWebhooks;
