import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        console.log("🔔 Clerk Webhook Triggered");

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const evt = wh.verify(req.body, headers); // already correct

        console.log("📦 Full Clerk Webhook Payload:", JSON.stringify(evt, null, 2));

        const { data, type } = evt;

        if (!data || !data.id) {
            console.warn("⚠️ Webhook received with no valid data:", evt);
            return res.status(400).json({ success: false, message: "Invalid data in webhook" });
        }

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
                await User.findByIdAndUpdate(data.id, userData, { upsert: true });
                console.log("✅ User Created or Updated in DB");
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
                console.log("⚠️ Unknown Webhook Event Type:", type);
                break;
        }

        res.status(200).json({ success: true, message: "Webhook handled" });

    } catch (error) {
        console.error("❌ Webhook Error: ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export default clerkWebhooks;
