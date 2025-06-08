import mongoose from "mongoose";

const connectDB = async ()=>{
try {
    mongoose.connection.on('connected', ()=> console.log("Database Connected")
    );

    await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking` )
} catch (error) {
    console.log(error.message);
}
}

mongoose.connection.once('open', () => {
  console.log("✅ Connected to DB host:", mongoose.connection.host);
});


export default connectDB;




