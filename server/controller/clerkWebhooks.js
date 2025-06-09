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

        // ✅ For raw body (you are using bodyParser.raw)
        await whook.verify(req.body, headers);

        // ✅ Parse the raw body (req.body is a Buffer)
        const { data, type } = JSON.parse(req.body.toString());

        console.log("📦 Webhook Type: ", type);
        console.log("👤 User Data: ", data);

        // ✅ Use correct Clerk field names
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

        res.json({ success: true, message: "Webhook Received" });
    } catch (error) {
        console.error("❌ Webhook Error: ", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export default clerkWebhooks;
