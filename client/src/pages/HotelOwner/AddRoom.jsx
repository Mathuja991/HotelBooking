import React, { useState } from 'react'
import Title from '../../components/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AddRoom = () => {
    const { axios, getToken } = useAppContext();

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null });

    const initialAmenities = {
        'Air Conditioning(Extra)': false,
        'Auspicious arrangements': false,
        'Entrance decoration (Banana trees)': false,
        'Iyer (Priest) services': false,
        'Musical instruments': false,
        'Special stage decoration': false,
        'Catering Service': false,
        'Chair covers': false,
    };

    const initialLunchMenus = {
        menu1: { selected: false, details: '' },
        menu2: { selected: false, details: '' },
        menu3: { selected: false, details: '' },
        menu4: { selected: false, details: '' },
    };

    const [inputs, setInputs] = useState({
        roomType: '',
        pricePerNight: '',
        capacity: '',
        amenities: initialAmenities,
        lunchMenus: initialLunchMenus,
        extraCurry: '',
        paidCurry: '',
    });

    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!inputs.roomType || !inputs.pricePerNight || !inputs.capacity || !Object.values(images).some(image => image)) {
            toast.error("Please fill in all the details");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('roomType', inputs.roomType);
            formData.append('pricePerNight', inputs.pricePerNight);
            formData.append('capacity', inputs.capacity);

            const amenities = Object.keys(inputs.amenities).filter(key => inputs.amenities[key]);
            formData.append('amenities', JSON.stringify(amenities));

            const selectedMenus = Object.keys(inputs.lunchMenus)
                .filter(key => inputs.lunchMenus[key].selected)
                .map(key => ({ menu: key, details: inputs.lunchMenus[key].details }));
            formData.append('lunchMenus', JSON.stringify(selectedMenus));

            formData.append('extraCurry', inputs.extraCurry);
            formData.append('paidCurry', inputs.paidCurry);

            Object.keys(images).forEach((key) => {
                if (images[key]) formData.append('images', images[key]);
            });

            const { data } = await axios.post('/api/rooms', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if (data.success) {
                toast.success(data.message);
                setInputs({
                    roomType: '',
                    pricePerNight: '',
                    capacity: '',
                    amenities: initialAmenities,
                    lunchMenus: initialLunchMenus,
                    extraCurry: '',
                    paidCurry: '',
                });
                setImages({ 1: null, 2: null, 3: null, 4: null });
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <form onSubmit={onSubmitHandler}>
                <Title align='left' font='outfit' title='Add Hall' subTitle='Fill in the hall information, amenities, and lunch menu details to make it available for customers.' />

                <p className='text-gray-800 mt-10'>Images</p>
                <div className='grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap'>
                    {Object.keys(images).map((key) => (
                        <label htmlFor={`roomImage${key}`} key={key}>
                            <img className='max-h-32 cursor-pointer opacity-80'
                                src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea} alt="" />
                            <input type="file" accept='image/*' id={`roomImage${key}`} hidden
                                onChange={e => setImages({ ...images, [key]: e.target.files[0] })} />
                        </label>
                    ))}
                </div>

                <div className='w-full flex max-sm:flex-col sm:gap-4 mt-4'>
                    <div className='flex-1 max-w-48'>
                        <p className='text-gray-800 mt-4'>Hall Type</p>
                        <select value={inputs.roomType} onChange={e => setInputs({ ...inputs, roomType: e.target.value })}
                            className='border opacity-70 border-gray-300 mt-1 rounded p-2 w-full'>
                            <option value="">Select Hall</option>
                            <option value="hall1">Hall 1</option>
                            <option value="hall2">Hall 2</option>
                        </select>
                    </div>

                    <div>
                        <p className='mt-4 text-gray-800'>Price <span className='text-xs'>/day</span></p>Rs.
                        <input type="number" placeholder='0' className='border border-gray-300 mt-1 rounded p-2 w-24'
                            value={inputs.pricePerNight}
                            onChange={e => setInputs({ ...inputs, pricePerNight: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <p className='mt-4 text-gray-800'>Capacity <span className='text-xs'>(People)</span></p>
                    <input type="number" placeholder='0' className='border border-gray-300 mt-1 rounded p-2 w-24'
                        value={inputs.capacity}
                        onChange={e => setInputs({ ...inputs, capacity: e.target.value })}
                    />
                </div>

                <p className='text-gray-800 font-semibold mt-8 mb-2'>Amenities</p>
                <div className='flex flex-col flex-wrap mt-1 text-gray-400 max-w-xl'>
                    {Object.keys(inputs.amenities).map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input type="checkbox"
                                id={`amenities${index + 1}`} checked={inputs.amenities[amenity]}
                                onChange={() => setInputs({ ...inputs, amenities: { ...inputs.amenities, [amenity]: !inputs.amenities[amenity] } })}
                            />
                            <label htmlFor={`amenities${index + 1}`}>{amenity}</label>
                        </div>
                    ))}
                </div>

                <p className='text-gray-800 font-semibold mt-8 mb-2'>Lunch Menu Options</p>
                <div className='flex flex-col flex-wrap mt-1 text-gray-400 max-w-xl gap-2'>
                    {Object.keys(inputs.lunchMenus).map((menu, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`lunchMenu${index + 1}`}
                                checked={inputs.lunchMenus[menu].selected}
                                onChange={() => setInputs({
                                    ...inputs,
                                    lunchMenus: {
                                        ...inputs.lunchMenus,
                                        [menu]: {
                                            ...inputs.lunchMenus[menu],
                                            selected: !inputs.lunchMenus[menu].selected
                                        }
                                    }
                                })}
                            />
                            <label htmlFor={`lunchMenu${index + 1}`}>{`Menu ${index + 1}`}</label>
                            <input
                                type="text"
                                placeholder='Type menu details'
                                className='border border-gray-300 mt-1 rounded p-2 flex-1'
                                value={inputs.lunchMenus[menu].details}
                                onChange={e => setInputs({
                                    ...inputs,
                                    lunchMenus: {
                                        ...inputs.lunchMenus,
                                        [menu]: {
                                            ...inputs.lunchMenus[menu],
                                            details: e.target.value
                                        }
                                    }
                                })}
                            />
                        </div>
                    ))}
                </div>

                <p className='text-gray-800 mt-4'>Extra Curry Details</p>
                <input type="text" placeholder='e.g., Chicken Curry, Fish Curry'
                    className='border border-gray-300 mt-1 rounded p-2 w-full max-w-md'
                    value={inputs.extraCurry}
                    onChange={e => setInputs({ ...inputs, extraCurry: e.target.value })}
                />

                <p className='text-gray-800 mt-4'>Paid Curry Details</p>
                <input type="text" placeholder='e.g., Prawn Curry (Rs. 500)'
                    className='border border-gray-300 mt-1 rounded p-2 w-full max-w-md'
                    value={inputs.paidCurry}
                    onChange={e => setInputs({ ...inputs, paidCurry: e.target.value })}
                />

                <button disabled={loading} type="submit"
                    className={`bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer ${loading && 'opacity-70 cursor-not-allowed'}`}>
                    {loading ? 'Adding...' : "Add hall"}
                </button>
            </form>
        </div>
    )
}

export default AddRoom;
