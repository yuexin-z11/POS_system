// pop_up.js
"use client";

import React, { useState, useEffect } from 'react';
import styles from './pop_up.module.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

const SizeSelectionPopup = ({ item, onClose, onSelectSize }) => {
    const [prices, setPrices] = useState({
        small: 0,
        medium: 0,
        large: 0,
    });

    // Fetch prices from backend when the component mounts
    useEffect(() => {
        fetchPriceFromBackend();
    }, [item]);

    // Fetch prices for all available sizes
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

    // Call onSelectSize when a size is selected
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
