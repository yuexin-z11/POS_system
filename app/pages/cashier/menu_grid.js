/**
 * MenuGrid Component
 * 
 * @author Yuexin Zhang
 * @description Displaying menu items in a grid format. This component allows users to interact with individual items. 
 * 
 */

"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './pos.module.css';
import SizeSelectionPopup from './pop_up';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

/**
 * Renders a menu grid for menu items for individual selections. 
 * 
 * @param {Function} addToOrderSummary - Function to add item ordered to the order summary.
 * @param {string|null} selectedCombo - Current combo type selected.
 * @param {Function} setSelectedSide - Function to add selected sides to combo.
 * @param {Function} setSelectedEntree - Function to add selected entrees to combo.
 * @param {Array} selectedEntree - Current list of selected entrees in the combo.
 * @param {Array} selectedSide - Current list of selected sides in the combo.
 * @param {Function} resetCombo - Function to reset the current combo state.
 * 
 * @returns {JSX.Element} MenuGrid Component
 */
const MenuGrid = ({ 
    addToOrderSummary,
    selectedCombo,
    setSelectedSide,
    setSelectedEntree,
    selectedEntree,
    selectedSide,
    resetCombo
  }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null); // State to store the selected item
    const [showPopup, setShowPopup] = useState(false); // Add showPopup state
    const [comboCompleted, setComboCompleted] = useState(false);

    /**
     * Fetch all menu items from the backend API.
     * 
     * @async
     * @throws {Error} If the API call fails.
     */
    const fetchMenuItems = async () => {
        console.log("fetching....");
        try {
            const response = await axios.get('/api/menu');
            const sortedItems = response.data.sort((a, b) => a.menu_item_id - b.menu_item_id); // Sort by menu_item_id
            setMenuItems(sortedItems);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    /**
     * Catagorizes the menu items by their type.
     * 
     * @returns {Object} An object where each key is a menu item type, and the value is an array of items.  
     */
    const categorizeItems = () => {
        return menuItems.reduce((acc, item) => {
            const { menu_item_type } = item;
            if (!acc[menu_item_type]) {
                acc[menu_item_type] = [];
            }

            if (menu_item_type === "N/A") {
                return acc;
            }

            if (!acc[menu_item_type]) {
                acc[menu_item_type] = [];
            }

            acc[menu_item_type].push(item);
            return acc;
        }, {});
    };

    const categorizedItems = categorizeItems();

    const validCategories = Object.keys(categorizedItems).filter(
        (category) => categorizedItems[category].length > 0
    );

    /**
     * Handles the selection of a menu item. 
     * 
     * @param {Object} item - Menu item that was clicked.
     */
    const handleItemClick = (item) => {
        // fetchPriceForCombo(item);
        if (selectedCombo) {
          // Skip popup and handle combo workflow
          handleComboWorkflow(item);
          return; // Skip showing popup
        }
      
        // Proceed with regular item selection if no combo is selected
        setSelectedItem(item);
        setShowPopup(true);
    };      
    
    /**
     * Closes the size selection popup and clears all selected items. 
     */
    const closePopup = () => {
        console.log("Popup closed");
        setSelectedItem(null); // Clear the selected item
        setShowPopup(false); // Hide the popup
    };

    /**
     * Hanfles the size selection of a menu item and adds the item to the order summary.
     * 
     * @param {Object} selectedItem - Menu item with the selected size.
     */
    const handleSelectSize = (selectedItem) => {
        console.log("Selected size:", selectedItem);
        addToOrderSummary(selectedItem);
        closePopup();
    };

    const COMBO_REQUIREMENTS = {
        bowl: { sides: 1, entrees: 1 },
        plate: { sides: 1, entrees: 2 },
        bigger_plate: { sides: 1, entrees: 3 },
    };    

    /**
     * Handles the workflow for adding items to a combo meal. 
     * 
     * @param {Object} item - Menu item to be added to the combo. 
     * @returns 
     */
    const handleComboWorkflow = (item) => {
        const comboRequirements = COMBO_REQUIREMENTS[selectedCombo];
        if (!comboRequirements) return;
    
        // Add sides
        if (item.menu_item_type === 'side' && selectedSide.length < comboRequirements.sides) {
            setSelectedSide((prev) => {
                const updatedSides = [...prev, item.menu_item_name];
                console.log('Adding side to order summary:', {
                    menu_item_id: item.menu_item_id,
                    menu_item_name: item.menu_item_name,
                });
    
                // Check for combo completion
                if (updatedSides.length === comboRequirements.sides && selectedEntree.length === comboRequirements.entrees) {
                    completeCombo();
                }
    
                return updatedSides;
            });
            fetchPriceForCombo(item); // Fetch and add price for the side
            return;
        }
    
        // Add entrees
        if (item.menu_item_type === 'entree' && selectedEntree.length < comboRequirements.entrees) {
            setSelectedEntree((prev) => {
                const updatedEntrees = [...prev, item.menu_item_name];

                console.log('Adding entree to order summary:', {
                    menu_item_id: item.menu_item_id,
                    menu_item_name: item.menu_item_name,
                });
    
                // Check for combo completion
                if (updatedEntrees.length === comboRequirements.entrees && selectedSide.length === comboRequirements.sides) {
                    completeCombo();
                }
    
                return updatedEntrees;
            });
            fetchPriceForCombo(item); // Fetch and add price for the entree
            return;
        }
    };    
    
    /**
     * Completes the combo selectiion workflow. Resets the combo state and enable the popup again. 
     */
    const completeCombo = () => {
        console.log("Combo completed");
        
        // Defer state updates to the next render cycle
        setTimeout(() => {
            resetCombo(); // Reset combo state
            setShowPopup(true); // Enable popup for other selections
        }, 0);
    };    

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    /**
     * Fetches the price of a combo item from the backend API and adds it to the order summary. 
     * 
     * @async
     * @param {Object} item - Menu iitem to fetch the price for.
     * @throws {Error} if API call fails.
     */
    const fetchPriceForCombo = async (item) => {
        try {
            const response = await axios.get(`/get-price/${item.menu_item_name}/${selectedCombo}`);
            const price = parseFloat(response.data.price);

            console.log(`Fetched price for ${selectedCombo}: ${price}`);
            const comboItem = {
                menu_item_id: item.menu_item_id,  // Item ID from the selected item
                menu_item_name: item.menu_item_name,  // Item name
                combo: 't',  // Combo flag
                combo_type: selectedCombo,  // The selected combo type (e.g., "bowl", "plate")
                size: item.size || 'Combo',  // You can set this to N/A if it's a combo, or adjust based on the logic
                price: price,  // Price fetched from the backend
            };
    
            // Add the combo item to the order summary using addToOrderSummary
            addToOrderSummary(comboItem);
        } catch (error) {
            console.error("Error fetching price:", error);
            alert("Failed to fetch price.");
        }
    };  

    /**
     * Determines whether a menu item should be enabled based on the current combo states. 
     * 
     * @param {Object} item - Menu item to check.
     * @returns {boolean} True if the item is enabled, false otherwise.
     */
    const isItemEnabled = (item) => {
        const comboRequirements = COMBO_REQUIREMENTS[selectedCombo];
    
        if (!selectedCombo) return true; // No combo selected, all items enabled
    
        if (comboRequirements) {
            // Disable items if their type is not the current selection's type
            if (selectedSide.length < comboRequirements.sides && item.menu_item_type === 'side') {
                return true;
            }
            if (selectedEntree.length < comboRequirements.entrees && item.menu_item_type === 'entree') {
                return true;
            }
            return false; // Disable all other items
        }

        if (comboCompleted) return true;
    
        return true; // Default case, enable everything
    };

    return (
        <div className={styles.gridContainer}>
            {validCategories.map((menu_item_type) => (
                <div key={menu_item_type} className={styles.category}>
                    <h2 className={styles.menuTypeTitle}>{menu_item_type}</h2>
                    <div className={styles.grid}>
                        {categorizedItems[menu_item_type].map((item, index) => {
                            const isEnabled = !selectedCombo || isItemEnabled(item);

                            return (
                                <div
                                    key={`${item.menu_item_name}-${index}`}
                                    className={`${styles.card} ${isEnabled ? '' : styles.disabled}`}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <h3>{item.menu_item_name}</h3>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            {showPopup && selectedItem && (
                <SizeSelectionPopup 
                    item={selectedItem} 
                    onClose={closePopup} 
                    onSelectSize={handleSelectSize} // Pass the size selection function
                />
            )}
        </div>
    );    
};

export default MenuGrid;
