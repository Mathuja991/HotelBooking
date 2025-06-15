import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const { user } = useUser(); // Clerk user (for auth)
  const { getToken } = useAuth(); // Clerk token
  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [backendUser, setBackendUser] = useState(null); // The user from your backend
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ✅ Fetch all rooms
  const fetchRooms = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Fetched rooms: ", data.rooms);
      setRooms(data.rooms);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // ✅ Fetch user from your backend (with role)
  const fetchUser = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("No token found");
        return;
      }

      const { data } = await axios.get(`/api/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Full fetched user response:", data);

      if (data && data.success) {
        setIsOwner(data.user.role === "hotelOwner");
        setBackendUser(data); // Store full backend user
        console.log("User role check completed:", data.user.role);
      } else {
        setTimeout(fetchUser, 5000); // Retry if not successful
        console.log("Retrying user fetch in 5 seconds...");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired, please login again.");
      } else {
        toast.error(error.message);
      }
      console.error(error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // ✅ Run fetchUser when Clerk user changes
  useEffect(() => {
    if (user) {
      fetchUser();
    } else {
      setIsAuthLoading(false);
    }
  }, [user]);

  // ✅ Run fetchRooms once on app load
  useEffect(() => {
    fetchRooms();
  }, []);

  const value = {
    currency,
    user, // Clerk user (for email, image, etc.)
    backendUser, // Backend user (for role, other custom fields)
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
    isAuthLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
