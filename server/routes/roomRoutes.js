import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRoom, getOwnerrooms, getRooms, toggleRoomAvailability,deleteRoom  } from "../controller/roomController.js";


const roomRouter =express.Router();
roomRouter.post('/',upload.array("images",4),protect,createRoom)
roomRouter.get('/',getRooms)
roomRouter.get('/owner',protect,getOwnerrooms)
roomRouter.post('/toggle-availability',protect,toggleRoomAvailability)
roomRouter.delete('/:roomId', protect, deleteRoom)


export default roomRouter;