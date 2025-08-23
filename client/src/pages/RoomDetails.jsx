import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams();
  const { rooms, getToken, axios } = useAppContext();
  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const [checkInDate, setCheckInDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guests, setGuests] = useState(1);
  const [isAvailable, setIsAvailable] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [selectedLunchMenu, setSelectedLunchMenu] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const selectedRoom = rooms?.find((r) => String(r._id) === String(id));
    if (selectedRoom) {
      setRoom(selectedRoom);
      setMainImage(selectedRoom.images?.[0]);
    }
  }, [rooms, id]);

  const checkAvailability = async () => {
    if (!checkInDate || !startTime || !endTime || !guestName || !phoneNumber) {
      toast.error("Please fill all fields before checking availability.");
      return;
    }
    if (startTime >= endTime) {
      toast.error("End time must be after start time.");
      return;
    }
    if (room?.capacity && guests > room.capacity) {
      toast.error(`Max capacity is ${room.capacity}.`);
      return;
    }

    try {
      const { data } = await axios.post("/api/bookings/check-availability", {
        room: id,
        checkInDate,
        startTime,
        endTime,
        guests,
      });

      if (data?.success) {
        setIsAvailable(data.isAvailable);
        toast[data.isAvailable ? "success" : "error"](data.isAvailable ? "Room is available" : "Room is not available");
      } else {
        toast.error(data?.message || "Could not check availability");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Network error";
      toast.error(`Availability error: ${msg}`);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!checkInDate || !startTime || !endTime || !guestName || !phoneNumber) {
      toast.error("Please fill all fields.");
      return;
    }
    if (startTime >= endTime) {
      toast.error("End time must be after start time.");
      return;
    }

    if (!isAvailable) {
      await checkAvailability();
      return;
    }

    try {
      setSubmitting(true);
      const token = await getToken();
      if (!token) {
        toast.error("You must be logged in to book.");
        setSubmitting(false);
        return;
      }

      const { data } = await axios.post(
        "/api/bookings/book",
        {
          room: id,
          checkInDate,
          startTime,
          endTime,
          guests,
          guestName,
          phoneNumber,
          paymentMethod: "Pay At Hotel",
          lunchMenus: selectedLunchMenu,
          optionalServices: selectedAddOns,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (data?.success) {
        toast.success("Booking successful");
        navigate("/my-bookings");
        window.scrollTo(0, 0);
      } else {
        toast.error(data?.message || "Booking failed");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Network error";
      toast.error(`Booking error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Room Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <h1 className="text-3xl md:text-4xl font-playfair">{room.roomType}</h1>
      </div>

      <div className="flex items-center gap-1 mt-2">
        <StarRating />
      </div>

      <div className="flex items-center gap-1 text-gray-500 mt-2">
        <img src={assets.locationIcon} alt="location icon" />
        <span>{room.hotel?.address}</span>
      </div>

      <div className="flex flex-col lg:flex-row mt-6 gap-6">
        <div className="lg:w-1/2 w-full">
          {mainImage && <img src={mainImage} alt="main" className="w-full rounded-xl shadow-lg object-cover" />}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
          {room.images?.length > 1 &&
            room.images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setMainImage(img)}
                className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === img ? "outline-3 outline-orange-500" : ""}`}
                alt={`room-${i}`}
              />
            ))}
        </div>
      </div>

      {/* Booking Form */}
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl"
      >
        <div className="flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500">
          {/* Phone Number */}
          <div className="flex flex-col">
            <label htmlFor="phoneNumber" className="font-medium">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              placeholder="Enter phone number"
              onChange={(e) => setPhoneNumber(e.target.value)}
              value={phoneNumber}
              className="max-w-xs rounded border border-gray-300 px-3 py-1.5 mt-1.5 outline-none"
              required
            />
          </div>

          {/* Guest Name */}
          <div className="flex flex-col">
            <label htmlFor="guestName" className="font-medium">Guest Name</label>
            <input
              type="text"
              id="guestName"
              placeholder="Enter guest name"
              onChange={(e) => setGuestName(e.target.value)}
              value={guestName}
              className="max-w-xs rounded border border-gray-300 px-3 py-1.5 mt-1.5 outline-none"
              required
            />
          </div>

          {/* Check-In Date */}
          <div className="flex flex-col">
            <label htmlFor="checkInDate" className="font-medium">Check-In</label>
            <input
              type="date"
              id="checkInDate"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckInDate(e.target.value)}
              value={checkInDate}
              className="w-full rounded border border-gray-300 px-3 py-1.5 mt-1.5 outline-none"
              required
            />
          </div>

          {/* Start Time */}
          <div className="flex flex-col">
            <label htmlFor="startTime" className="font-medium">Start Time</label>
            <input
              type="time"
              id="startTime"
              onChange={(e) => setStartTime(e.target.value)}
              value={startTime}
              className="w-full rounded border border-gray-300 px-3 py-1.5 mt-1.5 outline-none"
              required
            />
          </div>

          {/* End Time */}
          <div className="flex flex-col">
            <label htmlFor="endTime" className="font-medium">End Time</label>
            <input
              type="time"
              id="endTime"
              onChange={(e) => setEndTime(e.target.value)}
              value={endTime}
              className="w-full rounded border border-gray-300 px-3 py-1.5 mt-1.5 outline-none"
              required
            />
          </div>

          {/* Guests */}
          <div className="flex flex-col">
            <label htmlFor="guests" className="font-medium">Guests</label>
            <input
              type="number"
              id="guests"
              min="1"
              onChange={(e) => setGuests(parseInt(e.target.value || "1", 10))}
              value={guests}
              className="max-w-xs rounded border border-gray-300 px-3 py-1.5 mt-1.5 outline-none"
              required
            />
          </div>

          {/* Optional Add-Ons */}
          {room.optionalAddOns?.length > 0 && (
            <div className="flex flex-col mt-4">
              <label className="font-medium mb-1">Select Optional Add-ons</label>
              <div className="flex flex-wrap gap-2">
                {room.optionalAddOns.map((addon) => (
                  <label key={addon._id} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      value={addon.name}
                      checked={selectedAddOns.includes(addon.name)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedAddOns(prev =>
                          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
                        );
                      }}
                    />
                    <span>{addon.name} - ${addon.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

     {room.lunchMenus?.length > 0 && (
  <div className="flex flex-col mt-4">
    <label className="font-medium mb-1">Select Lunch Menu</label>
    <div className="flex flex-wrap gap-2">
      {room.lunchMenus.map((menuItem, idx) => {
        const labelText = `${menuItem.menu} - ${menuItem.details} ($${menuItem.price})`;
        return (
          <label
            key={idx}
            className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              value={menuItem.menu}
              checked={selectedLunchMenu.includes(menuItem.menu)}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedLunchMenu(prev =>
                  prev.includes(value)
                    ? prev.filter(v => v !== value)
                    : [...prev, value]
                );
              }}
            />
            <span>{labelText}</span>
          </label>
        );
      })}
    </div>
  </div>
)}

        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer disabled:opacity-60"
        >
          {isAvailable ? (submitting ? "Booking..." : "Book Now") : "Check Availability"}
        </button>
      </form>
    </div>
  );
};

export default RoomDetails;
