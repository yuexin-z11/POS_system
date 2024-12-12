"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MenuSection = ({ title, items, prices, staticPrices = {} }) => (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4 flex-1 mx-2">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <ul className="menu">
            {items.map((item, index) => {
                // Log the values of spice and woksmart to debug visibility
                console.log(item.name, item.spice, item.woksmart);

                return (
                    <li key={index} className="flex justify-between">
                        <span className="text-black flex items-center">
                            {/* Conditionally display icons if attributes are true */}
                            {item.spice && <img src="/images/spicy_icon.png" alt="Spicy" className="w-4 h-4 mr-2" />}
                            {item.woksmart && <img src="/images/wok_smart_icon.png" alt="Wok Smart" className="w-4 h-4 mr-2" />}
                            {prices[item.name]?.small == 6.70 && (
                                <img src="/images/premium_icon.avif" alt="Premium" className="w-4 h-4 mr-2" />
                            )}
                            <span className="text-sm">{item.name}</span>
                        </span>
                        <div className="flex gap-2">
                            {staticPrices[item.name] ? (
                                <span className="text-gray-600 text-sm">${staticPrices[item.name]}</span>
                            ) : (
                                <>
                                    {prices[item.name]?.small && prices[item.name].small !== "N/A" && prices[item.name].small > 0 && (
                                        <span className="text-gray-600 text-sm">${prices[item.name].small} | </span>
                                    )}
                                    {prices[item.name]?.medium && prices[item.name].medium !== "N/A" && prices[item.name].medium > 0 && (
                                        <span className="text-gray-600 text-sm">${prices[item.name].medium}</span>
                                    )}
                                    {prices[item.name]?.large && prices[item.name].large !== "N/A" && prices[item.name].large > 0 && (
                                        <span className="text-gray-600 text-sm"> | ${prices[item.name].large}</span>
                                    )}
                                </>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    </div>
);

function App() {
    const [menuItems, setMenuItems] = useState({ sides: [], entrees: [], extras: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [prices, setPrices] = useState({});

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/menu');
                const data = response.data;

                const categorizedItems = {
                    sides: data.filter(item => item.menu_item_type === 'side').map(item => ({
                        name: item.menu_item_name,
                        spice: item.menu_item_spice || false,
                        woksmart: item.menu_item_woksmart || false
                    })),
                    entrees: data.filter(item => item.menu_item_type === 'entree').map(item => ({
                        name: item.menu_item_name,
                        spice: item.menu_item_spice || false,
                        woksmart: item.menu_item_woksmart || false
                    })),
                    extras: data.filter(item => !['side', 'entree'].includes(item.menu_item_type)).map(item => ({
                        name: item.menu_item_name,
                        spice: item.menu_item_spice || false,
                        woksmart: item.menu_item_woksmart || false
                    })),
                };
                

                setMenuItems(categorizedItems);

                const pricesData = {};
                for (const item of data.map(item => item.menu_item_name)) {
                    const small = await fetchPrice(item, 'small');
                    const medium = await fetchPrice(item, 'medium');
                    const large = await fetchPrice(item, 'large');
                    pricesData[item] = { small, medium, large };
                }
                setPrices(pricesData);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchPrice = async (item, size) => {
            try {
                const response = await axios.get(`http://localhost:5000/get-price/${item}/${size}`);
                return response.data.price;
            } catch (error) {
                console.error('Error fetching price:', error);
                return "N/A";
            }
        };

        fetchMenuItems();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const comboPrices = { "Bowl": "8.30", "Plate": "9.80", "Bigger Plate": "11.30" };

    return (
        <div className="p-6 bg-maroon-800 min-h-screen text-black">
            <div className="flex items-center mb-4">
                <img
                    src="https://cdn.cookielaw.org/logos/fbcad385-5bbd-48ba-97d4-e5bcabcd10b9/67c1852a-0424-4c45-ae27-c587b2b01745/573a432a-97c1-4b6f-b44e-1911f400a20f/1200px-Panda_Express_logo.svg.png"
                    alt="Panda Express Logo"
                    className="w-16 h-16 mr-4"
                />
                <h1 className="text-2xl font-bold text-white">Panda Express Menu</h1>
            </div>

            <div className="flex justify-between mb-4">
                <MenuSection title="1. Choose a Combo" items={[{ name: "Bowl" }, { name: "Plate" }, { name: "Bigger Plate" }]} prices={{}} staticPrices={comboPrices} />
                <MenuSection title="2. Choose Sides" items={menuItems.sides} prices={prices} />
                <MenuSection title="3. Choose Entrees" items={menuItems.entrees} prices={prices} />
            </div>

            <div className="flex justify-between">
                <MenuSection title="4. Extras" items={menuItems.extras} prices={prices} />
            </div>
        </div>
    );
}

export default App;
