import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);


    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Listen for connection events
    mongoose.connection.on('connected', () => {
      console.log("🟢 Mongoose connected to DB");
    });

    mongoose.connection.on('error', (err) => {
      console.error("❌ Mongoose connection error:", err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn("⚠️ Mongoose disconnected");
    });

  } catch (error) {
    console.error("❌ Initial connection error:", error.message);
    process.exit(1); // Exit process if connection fails
  }
};

export default connectDB;
