/**
 * Panda Express Menu Page React Component
 * 
 * @author Sonika Madhu
 * @version 1.0.0
 * @description Responsive menu page for displaying Panda Express menu items, prices, and promotions
 
 */

"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './menuPage.module.css';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

/**
 * Renders a section of menu items with optional icons and pricing.
 * 
 * @param {Object} props - The component properties
 * @param {string} props.title - The title of the menu section
 * @param {Array} props.items - List of menu items to display
 * @param {Object} props.prices - Pricing information for menu items
 * @param {Object} [props.staticPrices={}] - Static prices for specific items
 * @param {string} [props.customClass=''] - Additional CSS class for styling
 * @returns {JSX.Element} A menu section with items and prices
 
 */
const MenuSection = ({ title, items, prices, staticPrices = {}, customClass = '' }) => (
    <div className={`${styles.menuBox} ${customClass}`}>
        <h2 className={`${styles.maroonTitle} text-xl font-semibold mb-2`}>{title}</h2>
        <ul className="menu">
            {items.map((item, index) => {
                return (
                    <li key={index} className="flex justify-between">
                        <span className="text-black flex items-center">
                            {/* Conditional icons for menu items */}
                            {item.spice && <img src="/images/spicy_icon.png" alt="Spicy" className="w-4 h-4 mr-2" />}
                            {item.woksmart && <img src="/images/wok_smart_icon.png" alt="Wok Smart" className="w-4 h-4 mr-2" />}
                            {prices[item.name]?.small == 6.70 && (
                                <img src="/images/premium_icon.avif" alt="Premium" className="w-4 h-4 mr-2" />
                            )}
                            <span className="text-xs">{item.name}</span>
                        </span>
                        <div className="flex gap-2">
                            {/* Pricing display logic */}
                            {staticPrices[item.name] ? (
                                <span className="text-gray-600 text-xxs">${staticPrices[item.name]}</span>
                            ) : (
                                <>
                                    {prices[item.name]?.small && prices[item.name].small !== "N/A" && prices[item.name].small > 0 && (
                                        <span className="text-gray-600 text-xs">${prices[item.name].small} | </span>
                                    )}
                                    {prices[item.name]?.medium && prices[item.name].medium !== "N/A" && prices[item.name].medium > 0 && (
                                        <span className="text-gray-600 text-xs">${prices[item.name].medium}</span>
                                    )}
                                    {prices[item.name]?.large && prices[item.name].large !== "N/A" && prices[item.name].large > 0 && (
                                        <span className="text-gray-600 text-xs"> | ${prices[item.name].large}</span>
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

/**
 * Main application component for the Panda Express menu page.
 * Fetches and displays menu items, prices, and promotional deals.
 * 
 * @returns {JSX.Element} The complete menu page UI
 */
function App() {
    // State variables to manage menu data, loading, and errors
    const [menuItems, setMenuItems] = useState({ sides: [], entrees: [], extras: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [prices, setPrices] = useState({});
    const [promos, setPromos] = useState([]);

    useEffect(() => {
        /**
         * Fetches menu items from the backend API and categorizes them.
         * Also retrieves pricing information for each item.
         * 
         * @async
         * @throws {Error} If there's an issue fetching menu data
         */
        const fetchMenuItems = async () => {
            try {
                // Fetch menu items and categorize them
                const response = await axios.get('/api/menu');
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
                // Fetch prices for each menu item
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
        /**
         * Fetches current promotional deals from the backend API.
         * 
         * @async
         * @throws {Error} If there's an issue fetching promotional data
         */
        const fetchPromos = async () => {
            try {
                const response = await axios.get('/api/promos'); // Fetch weekly promos
                setPromos(response.data);
            } catch (err) {
                console.error('Error fetching promos:', err);
            }
        };
        /**
         * Retrieves the price for a specific menu item and size.
         * 
         * @param {string} item - The name of the menu item
         * @param {string} size - The size of the item (small/medium/large)
         * @returns {Promise<number|string>} The price of the item or "N/A"
         */
        const fetchPrice = async (item, size) => {
            try {
                const response = await axios.get(`/get-price/${item}/${size}`);
                return response.data.price;
            } catch (error) {
                console.error('Error fetching price:', error);
                return "N/A";
            }
        };

        fetchMenuItems();
        fetchPromos();
    }, []);
    // Loading and error states
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const comboPrices = { "Bowl": "8.30", "Plate": "9.80", "Bigger Plate": "11.30" };

    return (
        <div className="p-6 bg-maroon-800 min-h-screen text-black">
            {/* Panda Express logo */}
            <div className="flex items-center mb-4">
                <img
                    src="https://cdn.cookielaw.org/logos/fbcad385-5bbd-48ba-97d4-e5bcabcd10b9/67c1852a-0424-4c45-ae27-c587b2b01745/573a432a-97c1-4b6f-b44e-1911f400a20f/1200px-Panda_Express_logo.svg.png"
                    alt="Panda Express"
                    className="w-28"
                />
            </div>
            <div className={styles.menuContainer}>
                {/* Menu section components */}
                <MenuSection title="1. Choose a Combo" items={[{ name: "Bowl" }, { name: "Plate" }, { name: "Bigger Plate" }]} prices={{}} staticPrices={comboPrices} customClass={styles.comboBox} />
                <MenuSection title="2. Sides" items={menuItems.sides} prices={prices} customClass={styles.sidesBox} />
                <MenuSection title="3. Entrees" items={menuItems.entrees} prices={prices} customClass={styles.entreesBox} />
                <MenuSection title="4. Extras" items={menuItems.extras} prices={prices} customClass={styles.extrasBox} />
                {/* Holiday season deals section */}
                <div className={`${styles.holidayDealsBox}`}>
                    <h2 className="text-xl font-semibold mb-2 text-white">Holiday Season Deals</h2>
                    <ul>
                        {promos.filter(promo => ["Beijing Beef", "Kung Pao Chicken", "Honey Walnut Shrimp", "Black Pepper Chicken"]
                            .includes(promo.menu_item_name))
                            .map((promo) => {
                                const originalPrices = prices[promo.menu_item_name] || {};
                                const discountedSmall = originalPrices.small ? (originalPrices.small - promo.discount_amount).toFixed(2) : "N/A";
                                const discountedMedium = originalPrices.medium ? (originalPrices.medium - promo.discount_amount).toFixed(2) : "N/A";
                                const discountedLarge = originalPrices.large ? (originalPrices.large - promo.discount_amount).toFixed(2) : "N/A";

                                const imageUrl = `/images/${promo.menu_item_name}.avif`;

                                return (
                                    <li key={promo.promo_id} className="mb-2 flex items-center">
                                        <img 
                                            src={imageUrl} 
                                            alt={promo.menu_item_name} 
                                            className="w-12 h-12 mr-4 object-cover"
                                        />
                                        <div>
                                            <p className="text-white">
                                                <strong>{promo.menu_item_name}</strong> - ${promo.discount_amount} off
                                            </p>
                                            <p className="text-white">
                                                <span>Small: ${discountedSmall} | </span>
                                                <span>Medium: ${discountedMedium} | </span>
                                                <span>Large: ${discountedLarge}</span>
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default App;
