"use client";

import { useEffect, useState } from 'react';
import styles from './pos.module.css';

const MenuGrid = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMenuItems = async () => {
        console.log("fetching....");
        try {
            const response = await fetch('http://localhost:5000/api/menu');
            
            if (!response.ok) {
                throw new Error('Failed to fetch menu items');
            }
            const data = await response.json();
            console.log("Fetched menu items:", data);
            setMenuItems(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);
    console.log("Current menuItems state:", menuItems);


    // a helper function to organize the fetched menu items by their type 
    const categorizeItems = () => {
        return menuItems.reduce((acc, item) => {
            const { menu_item_type } = item;
            if (!acc[menu_item_type]) {
                acc[menu_item_type] = [];
            }
            acc[menu_item_type].push(item);
            return acc;
        }, {});
    };

    const categorizedItems = categorizeItems();
    console.log("Categorized items:", categorizedItems);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.gridContainer}>
            {Object.keys(categorizedItems).map((menu_item_type) => (
                <div key={menu_item_type} className={styles.category}>
                    {/* Title for each menu item type */}
                    <h2 className={styles.menuTypeTitle}>{menu_item_type}</h2> 
                    <div className={styles.grid}>
                        {categorizedItems[menu_item_type].map((item, index) => (
                            <div key={`${item.menu_item_name}-${index}`} className={styles.card}>
                                <h3>{item.menu_item_name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
  );
};

export default MenuGrid;