import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);
   

    const [isAuthLoading, setIsAuthLoading] = useState(true);



  const fetchRooms = async () => {
  try {
    const token = await getToken(); // from Clerk Auth
    const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Fetched rooms: ", data.rooms);
    console.log(axios.defaults.baseURL)
    setRooms(data.rooms);
  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
};


const fetchUser = async () => {
  try {
    const token = await getToken();
    if (!token) {
      toast.error("No token found");
      return;
    }

    const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Full fetched user response: ", data); // Log the whole response

    // Check where the user object is
    if (data && data.success ) {
      setIsOwner(data.role === "hotelOwner");
      console.log("User role check completed.");
    } else {
      setTimeout(fetchUser, 5000);
      console.log("Retrying user fetch in 5 seconds...");
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      toast.error("Session expired, please login again.");
    } else {
      toast.error(error.message);
    }
    console.error(error);
  }
};


  useEffect(() => {
    if (user) {
      fetchUser();
    } else {
      setIsAuthLoading(false); // When no user is logged in
    }
  }, [user]);

  useEffect(() => {
    fetchRooms();
  }, []);

  





  const value = {
    currency,
    user,
    getToken,
    isOwner,
    setIsOwner,
    axios,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    rooms,
    setRooms,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
