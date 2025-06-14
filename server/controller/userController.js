import User from "../models/User.js";




const PRIMARY_OWNER_EMAIL = process.env.PRIMARY_OWNER_EMAIL || "mathujaparameshwaran@gmail.com";



export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id; // user id from token
    console.log("Fetching user with ID:", userId);

    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found in DB.");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("User found:", user);

    // If email matches and role is not yet 'hotelOwner', update role
    if (user.email === PRIMARY_OWNER_EMAIL && user.role !== "hotelOwner") {
      console.log(`User email matches PRIMARY_OWNER_EMAIL. Updating role from '${user.role}' to 'hotelOwner'`);
      user.role = "hotelOwner";
      await user.save();
      console.log("Role updated and saved in DB.");
    } else {
      console.log(`No role update needed. Current role: '${user.role}'`);
    }

    res.json({
      success: true,
      role: user.role,
      recentSearchedCities: user.recentSearchedCities,
    });
  } catch (error) {
    console.error("Error in getUserData:", error);
    res.json({ success: false, message: error.message });
  }
};


export const storeRecentSearchedCities = async (req,res)=>{
    try{
        const {recentSearchedCity}=req.body
        const user =await req.user;

        if(user.recentSearchedCities.length<3){
            user.recentSearchedCities.push(recentSearchedCity)
        }
        else{
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity)

        }

        await user.save();
        res.json({success: true, message: "City added"})
    } catch(error) {
       res.json({success: false, message: error.message})
    }
}