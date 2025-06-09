import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: { type: String, enum: ["user", "hotelOwner"], default: "user" },
    recentSearchedCities: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
