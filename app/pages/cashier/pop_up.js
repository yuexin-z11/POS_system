/**
 * Size Selection Popup Component
 * 
 * @author Yuexin Zhang
 * @description Popup component for selecting item sizes with dynamic price fetching
 * 
 */

"use client";

import React, { useState, useEffect } from 'react';
import styles from './pop_up.module.css';
import axios from 'axios';

//axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
axios.defaults.baseURL = 'http://localhost:5000';

/**
 * Renders a popup for selecting item sizes with corresponding prices.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.item - The menu item details
 * @param {Function} props.onClose - Callback to close the popup
 * @param {Function} props.onSelectSize - Callback when a size is selected
 * 
 * @returns {JSX.Element} Size selection popup
 */
const SizeSelectionPopup = ({ item, onClose, onSelectSize }) => {
    /**
     * State to manage prices for different sizes.
     * @type {Object}
     */
    const [prices, setPrices] = useState({
        small: 0,
        medium: 0,
        large: 0,
    });

    // Fetch prices from backend when the component mounts
    useEffect(() => {
        fetchPriceFromBackend();
    }, [item]);

    /**
     * Fetches prices for all available sizes of a menu item from the backend.
     * Updates the prices state for small, medium, and large sizes.
     * 
     * @async
     * @throws {Error} If there's an issue fetching prices
     */
    const fetchPriceFromBackend = async () => {
        try {
            const responseSmall = await axios.get(`/get-price/${item.menu_item_name}/small`);
            setPrices((prevPrices) => ({ ...prevPrices, small: parseFloat(responseSmall.data.price) }));

            const responseMedium = await axios.get(`/get-price/${item.menu_item_name}/medium`);
            setPrices((prevPrices) => ({ ...prevPrices, medium: parseFloat(responseMedium.data.price) }));

            const responseLarge = await axios.get(`/get-price/${item.menu_item_name}/large`);
            setPrices((prevPrices) => ({ ...prevPrices, large: parseFloat(responseLarge.data.price) }));
        } catch (error) {
            console.error("Error fetching price:", error);
        }
    };

    /**
     * Handles the selection of a specific item size.
     * Constructs a selected item object and calls the onSelectSize callback.
     * 
     * @param {string} size - Selected item size
     * @param {number} price - Price of the selected size
     */
    const handleSizeSelect = (size, price) => {
        const selectedItem = { 
            menu_item_id: item.menu_item_id,
            menu_item_name: item.menu_item_name, 
            size: size, 
            price: price 
        };
        console.log("Selected item in SizeSelectionPopup:", selectedItem);
        onSelectSize(selectedItem);  // Pass the selected item (name, size, price) to the parent
        onClose();  // Close the popup after selection
    };

    return (
        <div className={styles.popup}>
            <h3 className={styles.selectedItem}>Select Size for {item.menu_item_name}</h3>
            <div className={styles.sizeButtons}>
                {prices.small > 0 && (
                    <button className={styles.sizeButton} onClick={() => handleSizeSelect('Small', prices.small)}>
                        Small - ${prices.small.toFixed(2)}
                    </button>
                )}
                {prices.medium > 0 && (
                    <button className={styles.sizeButton} onClick={() => handleSizeSelect('Medium', prices.medium)}>
                        Medium - ${prices.medium.toFixed(2)}
                    </button>
                )}
                {prices.large > 0 && (
                    <button className={styles.sizeButton} onClick={() => handleSizeSelect('Large', prices.large)}>
                        Large - ${prices.large.toFixed(2)}
                    </button>
                )}
            </div>
            <div className={styles.closeButtonContainer}>
                <button className={styles.closeButton} onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default SizeSelectionPopup;
