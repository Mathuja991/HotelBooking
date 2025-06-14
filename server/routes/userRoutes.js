import express from "express"
import { protect } from "../middleware/authMiddleware.js";
import { getUserData, storeRecentSearchedCities,getUserById } from "../controller/userController.js";

const userRouter =express.Router();
userRouter.get('/',protect,getUserData);
userRouter.post('/store-recent-search',protect,storeRecentSearchedCities);
userRouter.get('/', protect, getUserById);



export default userRouter;