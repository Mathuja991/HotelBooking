import User from "../models/User.js";


const PRIMARY_OWNER_EMAIL = process.env.PRIMARY_OWNER_EMAIL || "mathujaparameshwaran@gmail.com";

// userController.js
export const getUserData = async (req, res) => {
  try {
    const userId = req.user._id;  // assuming req.user is set by protect middleware
    const user = await User.findById(userId).select('-password'); // exclude password

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

