import React, { useState } from 'react'
import Title from '../../components/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AddRoom = () => {
    const { axios, getToken } = useAppContext();

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null });

    // ✅ Lunch Menus
    const [lunchMenus, setLunchMenus] = useState([
        { menu: "Menu1", details: "", price: "" },
        { menu: "Menu2", details: "", price: "" },
    ]);

    // ✅ Optional Add-ons
    const [optionalAddOns, setOptionalAddOns] = useState([
        { name: "", price: "" }
    ]);

    const [inputs, setInputs] = useState({
        roomType: '',
        pricePerNight: '',
        capacity: '',
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

            formData.append('lunchMenus', JSON.stringify(lunchMenus.filter(l => l.details && l.price)));
            formData.append('optionalAddOns', JSON.stringify(optionalAddOns.filter(a => a.name && a.price)));

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
                setInputs({ roomType: '', pricePerNight: '', capacity: '', extraCurry: '', paidCurry: '' });
                setLunchMenus([{ menu: "Menu1", details: "", price: "" }]);
                setOptionalAddOns([{ name: "", price: "" }]);
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
                <Title align='left' font='outfit' title='Add Hall' subTitle='Fill in the hall information, lunch menus, and optional add-ons.' />

                {/* Upload Images */}
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

                {/* Hall Info */}
                <div className='w-full flex max-sm:flex-col sm:gap-4 mt-4'>
                    <div className='flex-1 max-w-48'>
                        <p className='text-gray-800 mt-4'>Hall Type</p>
                        <select value={inputs.roomType} onChange={e => setInputs({ ...inputs, roomType: e.target.value })}
                            className='border opacity-70 border-gray-300 mt-1 rounded p-2 w-full'>
                            <option value="">Select Hall</option>
                            <option value="Hall1">Hall 1</option>
                            <option value="Hall2">Hall 2</option>
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

                {/* Lunch Menus */}
                <p className='text-gray-800 font-semibold mt-8 mb-2'>Lunch Menu Options</p>
                {lunchMenus.map((menu, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Menu name (e.g., Menu1)"
                            className="border border-gray-300 rounded p-2"
                            value={menu.menu}
                            onChange={e => {
                                const updated = [...lunchMenus];
                                updated[index].menu = e.target.value;
                                setLunchMenus(updated);
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Details (e.g., Rice, Curry)"
                            className="border border-gray-300 rounded p-2 flex-1"
                            value={menu.details}
                            onChange={e => {
                                const updated = [...lunchMenus];
                                updated[index].details = e.target.value;
                                setLunchMenus(updated);
                            }}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            className="border border-gray-300 rounded p-2 w-24"
                            value={menu.price}
                            onChange={e => {
                                const updated = [...lunchMenus];
                                updated[index].price = e.target.value;
                                setLunchMenus(updated);
                            }}
                        />
                    </div>
                ))}
                <button type="button" onClick={() => setLunchMenus([...lunchMenus, { menu: "", details: "", price: "" }])}
                    className="text-sm text-blue-600 mt-2">+ Add Menu</button>

                {/* Optional Add-ons */}
                <p className='text-gray-800 font-semibold mt-8 mb-2'>Optional Add-ons</p>
                {optionalAddOns.map((addon, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Add-on name (e.g., Stage Decoration)"
                            className="border border-gray-300 rounded p-2 flex-1"
                            value={addon.name}
                            onChange={e => {
                                const updated = [...optionalAddOns];
                                updated[index].name = e.target.value;
                                setOptionalAddOns(updated);
                            }}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            className="border border-gray-300 rounded p-2 w-24"
                            value={addon.price}
                            onChange={e => {
                                const updated = [...optionalAddOns];
                                updated[index].price = e.target.value;
                                setOptionalAddOns(updated);
                            }}
                        />
                    </div>
                ))}
                <button type="button" onClick={() => setOptionalAddOns([...optionalAddOns, { name: "", price: "" }])}
                    className="text-sm text-blue-600 mt-2">+ Add Add-on</button>

                {/* Extra Curry */}
                <p className='text-gray-800 mt-4'>Extra Curry Details</p>
                <input type="text" placeholder='e.g., Chicken Curry, Fish Curry'
                    className='border border-gray-300 mt-1 rounded p-2 w-full max-w-md'
                    value={inputs.extraCurry}
                    onChange={e => setInputs({ ...inputs, extraCurry: e.target.value })}
                />

                {/* Paid Curry */}
                <p className='text-gray-800 mt-4'>Paid Curry Details</p>
                <input type="text" placeholder='e.g., Prawn Curry (Rs. 500)'
                    className='border border-gray-300 mt-1 rounded p-2 w-full max-w-md'
                    value={inputs.paidCurry}
                    onChange={e => setInputs({ ...inputs, paidCurry: e.target.value })}
                />

                {/* Submit */}
                <button disabled={loading} type="submit"
                    className={`bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer ${loading && 'opacity-70 cursor-not-allowed'}`}>
                    {loading ? 'Adding...' : "Add hall"}
                </button>
            </form>
        </div>
    )
}

export default AddRoom;
