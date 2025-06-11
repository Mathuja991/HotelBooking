import User from "../models/User.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.user.id; // user id from token
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const role = user.role;
    const recentSearchedCities = user.recentSearchedCities;

    res.json({ success: true, role, recentSearchedCities });
  } catch (error) {
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