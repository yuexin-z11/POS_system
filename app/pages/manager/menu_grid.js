"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './pos.module.css';
import SizeSelectionPopup from './pop_up';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';


const MenuGrid = ({
    addToOrderSummary, 
    selectedCombo,
    setSelectedCombo,
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


    // get all the menu items
    const fetchMenuItems = async () => {
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

    // a helper function to organize the fetched menu items by their type 
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
    
    const closePopup = () => {
        console.log("Popup closed");
        setSelectedItem(null); // Clear the selected item
        setShowPopup(false); // Hide the popup
    };

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

    const handleComboWorkflow = (item) => {
        const comboRequirements = COMBO_REQUIREMENTS[selectedCombo];
        
        if (!comboRequirements) return;
    
        // Add sides
        if (item.menu_item_type === 'side' && selectedSide.length < comboRequirements.sides) {
            setSelectedSide((prev) => {
                const updatedSides = [...prev, item.menu_item_name];
                // Check for combo completion inside the state update
                if (updatedSides.length === comboRequirements.sides && selectedEntree.length === comboRequirements.entrees) {
                    completeCombo();
                }
                return updatedSides;
            });
            fetchPriceForCombo(item); // Add price for the side
            return;
        }
    
        // Add entrees
        if (item.menu_item_type === 'entree' && selectedEntree.length < comboRequirements.entrees) {
            setSelectedEntree((prev) => {
                const updatedEntrees = [...prev, item.menu_item_name];
                // Check for combo completion inside the state update
                if (updatedEntrees.length === comboRequirements.entrees && selectedSide.length === comboRequirements.sides) {
                    completeCombo();
                }
                return updatedEntrees;
            });
            fetchPriceForCombo(item); // Add price for the entree
            return;
        }
    };
    
    // Helper function to handle combo completion
    const completeCombo = () => {
        console.log("Combo completed");
        
        // Defer state updates to the next render cycle
        setTimeout(() => {
            resetCombo(); // Reset combo state
            setShowPopup(true); // Enable popup for other selections
        }, 0);
    };  

    // useEffect(() => {
    //     if (comboCompleted) {
    //         console.log("Combo completed; enabling popup for future selections.");
    //         setShowPopup(true); // Enable popup
    //         resetCombo(); // Reset combo state
    //         setComboCompleted(false); // Reset comboCompleted flag
    //     }
    // }, [comboCompleted]);    

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

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
                size: 'Combo',  // You can set this to N/A if it's a combo, or adjust based on the logic
                price: price,  // Price fetched from the backend
            };
    
            // Add the combo item to the order summary using addToOrderSummary
            addToOrderSummary(comboItem);
        } catch (error) {
            console.error("Error fetching price:", error);
            alert("Failed to fetch price.");
        }
    };  

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