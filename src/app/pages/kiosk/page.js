"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './kioskview.css';

// Pop-up for when you click on an item and it prompts user to pick a size
const SizeSelectionModal = ({ prices, onClose, onSelect }) => {
    const availableSizes = Object.keys(prices).filter(size => prices[size] > 0);

    return (
        <div className="modal">
            <div className="modalContent">
                <h3>Select Size</h3>
                {availableSizes.length > 0 ? (
                    availableSizes.map(size => (
                        <button key={size} onClick={() => {
                            onSelect(prices[size]);
                            onClose();
                        }}>
                            {size.charAt(0).toUpperCase() + size.slice(1)} {/* Capitalize size name */}
                        </button>
                    ))
                ) : (
                    <p>No available sizes for this item.</p>
                )}
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

// Pop-up for when user clicks 'View Order'
const OrderSummaryModal = ({ orderItems, totalAmount, onClose }) => {
    return (
        <div className="modal">
            <div className="modalContent">
                <h3>Order Summary</h3>
                <ul>
                    {orderItems.map((item, index) => (
                        <li key={index}>
                            {item.name} - ${item.price.toFixed(2)}
                        </li>
                    ))}
                </ul>
                <div className="totalAmount">Total: ${totalAmount.toFixed(2)}</div>
                <button onClick={onClose}>Cash Out</button>
            </div>
        </div>
    );
};

// Pop-up message for if the user tries to click 'View Order' but hasn't selected any items
const EmptyOrderModal = ({ onClose }) => {
    return (
        <div className="modal">
            <div className="modalContent">
                <h3>Please add at least one item to your order</h3>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default function KioskView() {
    const [activeMenu, setActiveMenu] = useState('entrees');
    const [totalAmount, setTotalAmount] = useState(0);
    const [menuItems, setMenuItems] = useState({ sides: [], entrees: [], appetizers: [], desserts: [], drinks: [] });
    const [spicyEntrees, setSpicyEntrees] = useState([]);       //EDITED
    const [wokSmartEntrees, setWokSmartEntrees] = useState([]);       //ADDED
    const [premiumEntrees, setPremiumEntrees] = useState([]);       //ADDED
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [prices, setPrices] = useState({});
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [orderItems, setOrderItems] = useState([]); // To store the order items
    const [showOrderModal, setShowOrderModal] = useState(false); // To control order summary modal
    const [showEmptyOrderModal, setShowEmptyOrderModal] = useState(false); // To control empty order modal

    useEffect(() => {
        // Fetches all menu items and their prices, categorizes them by type
        const fetchMenuItems = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/menu');
                const data = response.data;

                //console.log(data);

                const categorizedItems = {
                    entrees: data.filter(item => item.menu_item_type === 'entree').map(item => item.menu_item_name),
                    sides: data.filter(item => item.menu_item_type === 'side').map(item => item.menu_item_name),
                    appetizers: data.filter(item => item.menu_item_type === 'appetizer').map(item => item.menu_item_name),
                    desserts: data.filter(item => item.menu_item_type === 'dessert').map(item => item.menu_item_name),
                    drinks: data.filter(item => item.menu_item_type === 'drink').map(item => item.menu_item_name),
                };

                setMenuItems(categorizedItems);

                // Fetch prices for each item
                const pricesData = {};
                for (const item of data.map(item => item.menu_item_name)) {
                    const small = await fetchPrice(item, 'small');
                    const medium = await fetchPrice(item, 'medium');
                    const large = await fetchPrice(item, 'large');
                    pricesData[item] = { small: Number(small), medium: Number(medium), large: Number(large) }; // Convert to numbers
                }
                setPrices(pricesData);

                //categorize entrees that are spicy and wok smart
                /*                   EDITED
                const specialEntrees = {
                    spicy: data.filter(item => item.menu_item_spice === 't').map(item => item.menu_item_name),
                    wok: data.filter(item => item.menu_item_woksmart === 't').map(item => item.menu_item_name),
                };
                setSpecialEntrees(specialEntrees);

                console.log('Special Entrees:', specialEntrees);
                */
                
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchSpicy = async () => {                  //WIP
            try {
                const response = await axios.get('http://localhost:5000/api/spice');
                const data = response.data.map(item => item.menu_item_name);
                setSpicyEntrees(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchWokSmart = async () => {                  //WIP
            try {
                const response = await axios.get('http://localhost:5000/api/wok');
                const data = response.data.map(item => item.menu_item_name);
                setWokSmartEntrees(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchPremium = async () => {                  //WIP
            try {
                const response = await axios.get('http://localhost:5000/api/premium');
                const data = response.data.map(item => item.menu_item_name);
                setPremiumEntrees(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        // Fetches the price for an item given its size
        const fetchPrice = async (item, size) => {
            try {
                const response = await axios.get(`http://localhost:5000/get-price/${item}/${size}`);
                return response.data.price || 0; // Default to 0 if price is undefined
            } catch (error) {
                console.error('Error fetching price:', error);
                return 0; // Default to 0 on error
            }
        };

        fetchMenuItems();
        fetchSpicy();
        fetchWokSmart();
        fetchPremium();
    }, []);

    // Updates the total as items get added to the order
    const addToTotal = (price, itemName) => {
        setTotalAmount(prevTotal => prevTotal + price);
        setOrderItems(prevItems => [...prevItems, { name: itemName, price }]); // Add item to order
    };

    // Handles displaying correctly formatted prices to menu cards, taking into account certain items with piece counts
    const formatPrices = (priceData, itemName) => {
        // Define quantities for specific items
        const quantityMap = {
            "Chicken Egg Roll": { small: 1, medium: 6 },
            "Veggie Spring Roll": { small: 2, medium: 12 },
            "Cream Cheese Rangoon": { small: 3, medium: 12 },
            "Apple Pie Roll": { small: 1, medium: 4, large: 6 }
        };
    
        const pricesToDisplay = [];
    
        // Check if item has specific quantities
        if (quantityMap[itemName]) {
            if (priceData.small > 0) {
                pricesToDisplay.push(`$${priceData.small.toFixed(2)} (${quantityMap[itemName].small} pc)`);
            }
            if (priceData.medium > 0) {
                pricesToDisplay.push(`$${priceData.medium.toFixed(2)} (${quantityMap[itemName].medium} pc)`);
            }
            if (priceData.large > 0 && quantityMap[itemName].large) {
                pricesToDisplay.push(`$${priceData.large.toFixed(2)} (${quantityMap[itemName].large} pc)`);
            }
        } else {
            // For items without specific quantities, display prices normally
            if (priceData.small > 0) {
                pricesToDisplay.push(`$${priceData.small.toFixed(2)}`);
            }
            if (priceData.medium > 0) {
                pricesToDisplay.push(`$${priceData.medium.toFixed(2)}`);
            }
            if (priceData.large > 0) {
                pricesToDisplay.push(`$${priceData.large.toFixed(2)}`);
            }
        }
    
        return pricesToDisplay.join(" | ");
    };
    
    // Handles when user selects a menu item
    const handleItemClick = (item) => {
        setSelectedItem(item);
        setShowSizeModal(true);
    };

    // Handles when user selects a size from the pop-up
    const handleSizeSelect = (price) => {
        addToTotal(price, selectedItem);
    };

    // Handles when user selects 'View Order'
    const handleViewOrder = () => {
        if (orderItems.length === 0) {
            setShowEmptyOrderModal(true); // Show empty order modal if no items
        } else {
            setShowOrderModal(true); // Show the order summary modal
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    // Front end view
    return (
        <div className="kioskContainer">
            <h2 className="kioskHeader">Kiosk</h2>
            <div className="mainContent">
                {/* Sidebar Menu */}
                <div className="sidebar">
                    {Object.keys(menuItems).map((menu) => (
                        <button
                            key={menu}
                            className={`menuButton ${activeMenu === menu ? 'active' : ''}`}
                            onClick={() => setActiveMenu(menu)}
                        >
                            {menu.charAt(0).toUpperCase() + menu.slice(1)} {/* Capitalize menu name */}
                        </button>
                    ))}
                </div>

                {/* Grid of Items */}
                <div className="itemsGrid">
                    {menuItems[activeMenu].map((item, index) => {
                        const priceData = prices[item] || { small: 0, medium: 0, large: 0 };
                        const priceToDisplay = formatPrices(priceData, item);

                        const isSpicy = spicyEntrees.includes(item);    //EDITED
                        const isWokSmart = wokSmartEntrees.includes(item);    //EDITED
                        const isPremium = premiumEntrees.includes(item);    //ADDED

                        return (
                            <div key={index} className="menuItem" onClick={() => handleItemClick(item)}>
                                <div className="itemImage">
                                    <img src={`/images/${item}.avif`} alt={item}/>
                                </div>
                                <div className="icon">
                                    {isPremium && <img src={`/images/premium_icon.avif`} alt="premium" className="w-20 h-10 mr-10"/>}
                                    {isWokSmart && <img src={`/images/wok_smart_icon.avif`} alt="wok smart" className="w-8 h-8"/>}
                                    {isSpicy && <img src={`/images/spicy_icon.avif`} alt="spicy" className="w-8 h-8"/>}
                                </div>
                                <span className="itemName">{item}</span>
                                <span className="itemPrice">{priceToDisplay || 'N/A'}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="footer">
                <div className="totalAmount">Total: ${totalAmount.toFixed(2)}</div>
                <button className="viewOrderButton" onClick={handleViewOrder}>View Order</button>
            </div>

            {/* Size Selection Modal */}
            {showSizeModal && selectedItem && (
                <SizeSelectionModal
                    prices={prices[selectedItem]}
                    onClose={() => setShowSizeModal(false)}
                    onSelect={handleSizeSelect}
                />
            )}

            {/* Order Summary Modal */}
            {showOrderModal && (
                <OrderSummaryModal
                    orderItems={orderItems}
                    totalAmount={totalAmount}
                    onClose={() => setShowOrderModal(false)}
                />
            )}

            {/* Empty Order Modal */}
            {showEmptyOrderModal && (
                <EmptyOrderModal
                    onClose={() => setShowEmptyOrderModal(false)}
                />
            )}
        </div>
    );
}
