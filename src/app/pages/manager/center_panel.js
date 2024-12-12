"use client";


import React, { useEffect, useState } from 'react';
import axios from 'axios';


const CenterPanel = ({ selectedType }) => {
    const [items, setItems] = useState([]);


    useEffect(() => {
        // Only fetch menu items if a type is selected
        if (selectedType) {
            fetchMenuItems(selectedType);
        }
    }, [selectedType]);


    const fetchMenuItems = async (type) => {
        try {
            // Use absolute URL for API call
            const response = await axios.get(`http://localhost:3001/api/menu-items/${type}`);
            setItems(response.data);  // Assuming response.data is an array of items
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
        }
    };


    return (
        <div className="center-panel">
            <h2>Items for {selectedType}</h2>
            {items.length > 0 ? (
                <div className="menu-items">
                    {items.map((item) => (
                        <button
                            key={item.menu_item_name} // Use a unique key
                            onClick={() => console.log(`You clicked on: ${item.menu_item_name}`)} // Add action on click
                            className="menu-item-button"
                        >
                            {item.menu_item_name} {/* Displaying the name of the menu item */}
                        </button>
                    ))}
                </div>
            ) : (
                <p>No items available.</p> // Fallback if no items are fetched
            )}
        </div>
    );
};


export default CenterPanel;





