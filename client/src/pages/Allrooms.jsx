import React, { useState, useMemo } from 'react';
import { facilityIcons, assets } from '../assets/assets';
import { useSearchParams } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input 
        type="checkbox" 
        checked={selected} 
        onChange={(e) => onChange(e.target.checked, label)}
      />
      <span className='font-light select-none'>{label}</span>
    </label>
  );
};

const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input 
        type="radio" 
        name="sortOption" 
        checked={selected} 
        onChange={() => onChange(label)}
      />
      <span className='font-light select-none'>{label}</span>
    </label>
  );
};

const Allrooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, navigate, currency } = useAppContext();
  const [openFilters, setOpenFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    capacity: [],
    priceRange: [],
    features: [],
  });
  const [selectedSort, setSelectedSort] = useState('');
  
  const capacityOptions = [
    '0-50 guests',
    '50-100 guests',
    '100-200 guests',
    '200+ guests'
  ];
  
  const priceRanges = [
    '0 to 500',
    '500 to 1000',
    '1000 to 2000',
    '2000 to 3000',
  ];

  const sortOptions = [
    "Price Low to High",
    "Price High to Low",
    "Newest First"
  ];

  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (checked) {
        updatedFilters[type].push(value);
      } else {
        updatedFilters[type] = updatedFilters[type].filter(item => item !== value);
      }
      return updatedFilters;
    });
  };

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
  };

  const matchesCapacity = (room) => {
    if (selectedFilters.capacity.length === 0) return true;
    
    return selectedFilters.capacity.some(range => {
      const [min, max] = range.split('-')[0].split('+')[0].split(' ')[0].split('-').map(Number);
      
      if (range.includes('+')) {
        return room.capacity >= min;
      }
      return room.capacity >= min && room.capacity <= max;
    });
  };

  const matchesPriceRange = (room) => {
    return selectedFilters.priceRange.length === 0 || 
           selectedFilters.priceRange.some(range => {
             const [min, max] = range.split(' to ').map(Number);
             return room.pricePerNight >= min && room.pricePerNight <= max;
           });
  };

  const sortRooms = (a, b) => {
    if (selectedSort === 'Price Low to High') {
      return a.pricePerNight - b.pricePerNight;
    } else if (selectedSort === 'Price High to Low') {
      return b.pricePerNight - a.pricePerNight;
    } else if (selectedSort === 'Newest First') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  };

  const filterDestination = (room) => {
    const destination = searchParams.get('destination');
    if (!destination) return true;
    return room.hotel.city.toLowerCase().includes(destination.toLowerCase());
  };

  const filteredRooms = useMemo(() => {
    return rooms
      .filter(room => matchesCapacity(room) && matchesPriceRange(room) && filterDestination(room))
      .sort(sortRooms);
  }, [rooms, selectedFilters, selectedSort, searchParams]);

  const clearFilters = () => {
    setSelectedFilters({
      capacity: [],
      priceRange: [],
      features: [],
    });
    setSelectedSort('');
    setSearchParams({});
  };

  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
      <div className='w-full lg:w-3/4'>
        <div className='flex flex-col items-start text-left'>
          <h1 className='font-playfair text-4xl md:text-[40px]'>Hall details</h1>
        </div>

        {filteredRooms.map((room) => (
          <div key={room._id} className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'>
            <img 
              onClick={() => {
                navigate(`/halls/${room._id}`);
                window.scrollTo(0, 0);
              }}
              src={room.images[0]} 
              alt="room-img"  
              title='View Hall Details'
              className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer'
            />
            
            <div className='md:w-1/2 flex flex-col gap-2'>
              <p className='text-gray-500'>{room.hotel.city}</p>
              <p 
                onClick={() => {
                  navigate(`/halls/${room._id}`);
                  window.scrollTo(0, 0);
                }} 
                className='text-gray-800 text-3xl font-playfair cursor-pointer'
              >
                {room.hotel.name}
              </p>
              <div className='flex items-center'>
                <StarRating />
                <p className='ml-2'>200+ reviews</p>
              </div>
              <div className='flex items-center gap-1 text-gray-500 mt-2'>
                <img src={assets.locationIcon} alt="location-icon" />
                <span>{room.hotel.address}</span>
              </div>
              <div className='flex items-center gap-1 text-black-50 mt-2'>
               
                <span>Capacity: {room.capacity} guests</span>
              </div>
              <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                {room.amenities.map((item, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />
                    <p className='text-xs'>{item}</p>
                  </div>
                ))}
              </div>
              <p className='text-xl font-medium text-gray-700'>
                {currency === 'USD' ? '$' : 'Rs.'}{room.pricePerNight}/day
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className='bg-white w-full lg:w-80 border border-gray-300 text-gray-600 max-lg:mb-8 lg:mt-16 lg:ml-8'>
        <div className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300 ${openFilters && "border-b"}`}>
          <p className='text-base font-medium text-gray-800'>FILTER</p>
          <div className='text-xs cursor-pointer'>
            <span 
              onClick={() => setOpenFilters(!openFilters)} 
              className='lg:hidden'
            >
              {openFilters ? 'HIDE' : 'SHOW'}
            </span>
            <span 
              onClick={clearFilters}
              className='hidden lg:block'
            >
              CLEAR
            </span>
          </div>
        </div>
                  
        <div className={`${openFilters ? 'h-auto' : "h-0 lg:h-auto"} overflow-hidden transition-all duration-700`}>
          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>Capacity</p>
            {capacityOptions.map((capacity, index) => (
              <CheckBox 
                key={index}  
                label={capacity} 
                selected={selectedFilters.capacity.includes(capacity)}
                onChange={(checked) => handleFilterChange(checked, capacity, 'capacity')}
              />
            ))}
          </div>

          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>Price Ranges</p>
            {priceRanges.map((range, index) => (
              <CheckBox 
                key={index}  
                label={`${currency === 'USD' ? '$' : 'Rs.'}${range}`}
                selected={selectedFilters.priceRange.includes(range)}
                onChange={(checked) => handleFilterChange(checked, range, 'priceRange')}
              />
            ))}
          </div>

          <div className='px-5 pt-5 pb-7'>
            <p className='font-medium text-gray-800 pb-2'>Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton 
                key={index}  
                label={option}
                selected={selectedSort === option}
                onChange={handleSortChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allrooms;