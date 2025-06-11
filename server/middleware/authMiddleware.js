import { Message } from "svix/dist/api/message.js";
import User from "../models/User.js";


export const protect = async (req,res,next)=>{
    const {userId} =req.auth;
    if(!userId){ 
        res.json({success:false,Message :"not authenticated"})

    }else{
        const user =await User.findById(userId);
        req.user =user;
        next()
        
    }
}