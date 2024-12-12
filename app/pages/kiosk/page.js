
"use client";

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './kioskview.css';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';


// Pop-up for when you click on an item and it prompts user to pick a size
const SizeSelectionModal = ({ prices, onClose, onSelect }) => {
    const availableSizes = Object.keys(prices).filter(size => prices[size] > 0);

    return (
        <div className="modal">
            <div className="modalContent">
                <h3>Select Size</h3>
                <div className="sizeButtonContainer">
                    {availableSizes.length > 0 ? (
                        availableSizes.map(size => (
                            <button 
                                key={size} 
                                onClick={() => {
                                    const formattedSize = size.charAt(0).toUpperCase() + size.slice(1); // Capitalize size
                                    onSelect(prices[size], formattedSize); // Pass the formatted size
                                    onClose();
                                }} 
                                className="sizeButton"
                            >
                                <div>{size.charAt(0).toUpperCase() + size.slice(1)}</div> {/* Capitalize size name */}
                                <div>+${prices[size].toFixed(2)}</div> {/* Display price below size */}
                            </button>
                        ))
                    ) : (
                        <p>No available sizes for this item.</p>
                    )}
                </div>
                <button onClick={onClose} className="cancelButton">Cancel</button>
            </div>
        </div>
    );
};


//pop-up showing how many points accumulated
const PointsInfoModal = ({ pointsMessage, onClose }) => {
    return (
        <div className="modalOverlay">
            <div className="modalContent">
                <h3>Rewards Summary</h3>
                <p>{pointsMessage}</p>
                <button className="closeButton" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

// Pop-up for when user clicks 'View Order'
const OrderSummaryModal = ({ orderItems, totalAmount, onClose, onCashOut, setOrderItems, setTotalAmount, setShowOrderModal}) => {
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [pointsMessage, setPointsMessage] = useState('');
    const [showPointsModal, setShowPointsModal] = useState(false);
    const priceDeductedRef = useRef(false);
    const [nextOrderId, setNextOrderId] = useState(null);

    const fetchNextOrderId = async () => {
        console.log('Starting fetch for next order ID...');
        try {
            const response = await axios.get('/api/highest-order-id');
            
            const data = response.data;
            console.log('Fetch data:', data);
    
            // Check for the correct response format
            if (data.success && typeof data.highestOrderId === 'number') {
                const nextOrderId = data.highestOrderId + 1; // Increment by 1
                console.log('Next order ID:', nextOrderId);
                return nextOrderId;
            } else {
                console.error('Unexpected response format:', data);
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.error('Failed to fetch the next order ID:', error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
            return null;
        }
    };
    
    const handleFetchNextOrderId = async () => {
        const fetchedOrderId = await fetchNextOrderId();
        if (fetchedOrderId) {
            setNextOrderId(fetchedOrderId);
            console.log('Fetched Order ID:', fetchedOrderId); // Debugging
        } else {
            alert('Failed to fetch the next order ID.');
        }
    };      

    useEffect(() => {
        if (setShowOrderModal) {
            handleFetchNextOrderId(); // Fetch the next order ID
        }
    }, [setShowOrderModal]);    

    useEffect(() => {
        const getNextOrderId = async () => {
            console.log('Fetching next order ID...');
            const nextId = await fetchNextOrderId();
            if (nextId) {
                setNextOrderId(nextId); // Update state
                console.log('Next Order ID:', nextId);
            }
        };
        getNextOrderId();
    }, []);    

    const handleCashOutClick = async () => {
        if (!nextOrderId) {
            alert('Order ID is not ready yet!');
            return;
        }
    
        const response = await onCashOut({ 
            orderId: nextOrderId,
            customerName, 
            customerEmail, 
            customerPhone, 
            totalAmount 
        });

        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const employee_id = userData ? userData.employee_id : null;

            let comboItemsRemaining = 0; // Tracks how many items to mark as combo
            let currentComboType = ''; // Stores the current combo type ("bowl", "plate", "bplate")

            // Fetch menu_item_id for each item in the order
            const updatedOrderItems = await Promise.all(
                orderItems.map(async (item, index) => {
                    let combo = 'f';
                    let combo_type = 'N/A';

                    // Check for combo names and set comboItemsRemaining and currentComboType
                    if (item.name === "Bowl") {
                        comboItemsRemaining = 2;
                        currentComboType = "bowl";
                        return null;
                    } else if (item.name === "Plate") {
                        comboItemsRemaining = 3;
                        currentComboType = "plate";
                        return null;
                    } else if (item.name === "Bigger Plate") {
                        comboItemsRemaining = 4;
                        currentComboType = "bplate";
                        return null;
                    }

                    // If the current item is part of a combo
                    if (comboItemsRemaining > 0) {
                        comboItemsRemaining--;
                        combo = 't';
                        combo_type = currentComboType;
                    }

                    // Fetch the menu_item_id for the current item
                    const result = await axios.get(`/api/get-item-id-by-name/${item.name}`);
                    if (result.status === 200) {
                        return {
                            ...item,
                            menu_item_id: result.data.menu_item_id,
                            combo,
                            combo_type,
                        };
                    } else {
                        console.error(`Menu item ID not found for item: ${item.name}`);
                        return {
                            ...item,
                            menu_item_id: null,
                            combo,
                            combo_type,
                        };
                    }
                })
            );

            // Remove items that are null, undefined, or have null/undefined names
            const filteredOrderItems = updatedOrderItems.filter(item => item && item.name != null);
    
            // Prepare the order data
            const orderData = {
                employee_id: employee_id || null,
                order_price: totalAmount,
                order_status: 'Awaiting',
                order_items: filteredOrderItems.map(item => ({
                    menu_item_id: item.menu_item_id || null,
                    combo: item.combo || 'f',
                    combo_type: item.combo_type || 'N/A',
                    item_size: item.size || 'N/A',
                    recorded_quantity: item.recorded_quantity || 1,
                }))
            };
    
            // Step 1: Add the order to the database
            const response = await axios.post('/api/add-order', orderData, {
                headers: { 'Content-Type': 'application/json' }
            });
    

            if (response.status === 200) {
                console.log('Order added successfully:', response.data);
    
                // Step 2: Handle cash-out logic for rewards

                const cashOutResponse = await onCashOut({
                    customerName,
                    customerEmail,
                    customerPhone,
                    totalAmount

                });
    
                if (cashOutResponse.error) {
                    alert(cashOutResponse.error);
                    return;
                }
    
                // Step 3: Update the UI based on the cash-out response
                let discountedTotal = totalAmount;
                if (cashOutResponse.discountApplied) {
                    discountedTotal = cashOutResponse.finalPrice;
                    setTotalAmount(discountedTotal);
                }
    
                // Set the points message based on the cash-out response
                if (cashOutResponse.discountApplied) {
                    setPointsMessage(`You received a 10% discount! Final price: $${discountedTotal.toFixed(2)}. Remaining points: ${cashOutResponse.remainingPoints}`);
                } else {
                    setPointsMessage(`Final price: $${discountedTotal.toFixed(2)}. Points accumulated: ${cashOutResponse.remainingPoints}`);
                }
    
                // Step 4: Show the rewards summary modal
                setShowPointsModal(true);
            } else {
                console.error('Error placing order:', response.statusText);
                alert('There was an error processing your order 1.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error processing your order 2.');
        }
    };
    
    // Function to handle closing the modal for points
    const handleClosePointsModal = () => {
        setShowPointsModal(false);
        setOrderItems([]);
        setTotalAmount(0);
        setShowOrderModal(false);
    };

    // Function to handle removing a selected item from an order
    const handleRemoveItem = (indexToRemove) => {
        priceDeductedRef.current = false;
        setOrderItems((prevItems) => {
            const newItems = [...prevItems];

            const removedItem = newItems[indexToRemove];
            console.log('Removing items:', removedItem);
    
            //Check if the removed item is a combo
            if (newItems[indexToRemove].name === 'Bowl' ||
                newItems[indexToRemove].name === 'Plate' ||
                newItems[indexToRemove].name === 'Bigger Plate') {

                //Remove the combo and its associated items (negative prices following it)
                if(removedItem.price >= 0 && !priceDeductedRef.current){
                    setTotalAmount(prevTotal => prevTotal - removedItem.price.toFixed(2));
                    priceDeductedRef.current = true;
                }
                let comboIndex = indexToRemove;
                newItems.splice(comboIndex, 1); //Remove the combo item
    
                //Remove associated combo items (negative prices directly following the combo)
                while (comboIndex < newItems.length && newItems[comboIndex].price < 0) {
                    newItems.splice(comboIndex, 1);
                }
            } else {
                //Otherwise, remove the single non-combo item and its associated price
                if(removedItem.price >= 0 && !priceDeductedRef.current){
                    setTotalAmount(prevTotal => prevTotal - removedItem.price.toFixed(2));
                    priceDeductedRef.current = true;
                }
                newItems.splice(indexToRemove, 1);
            }
    
            console.log('New items:', newItems);
            return newItems;
        });
    };

    //Fix issue where sometimes totalAmount is very small negative number close to 0 rather than 0
    useEffect(() => {
        if(totalAmount < 0){
            setTotalAmount(0);
        }
    }, [totalAmount]);
    

    return (
        <div className="modal">
            <div className="modalContent">
                <h3>Order ID: {nextOrderId}</h3>
                <div className="orderItemContainer">
                    <ul className="orderSummaryItems">
                        {orderItems.map((item, index) => (
                            <li key={index} className={item.price < 0 ? 'comboItem' : ''}>
                                {item.price < 0 && '- '} {item.name} {item.price >= 0 && ` - $${item.price.toFixed(2)}`}
                            
                                {item.price >= 0 && (
                                    <button className="removeButton" onClick={(e) => {e.stopPropagation(); handleRemoveItem(index);}}>X</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="totalAmount">Total: ${totalAmount.toFixed(2)}</div>
                
                <h4>Optional: Enter your information below to join our rewards program!</h4>
                {/* Customer Information Fields */}
                <input 
                    type="text" 
                    placeholder="Name" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                    className="customerInput"
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={customerEmail} 
                    onChange={(e) => setCustomerEmail(e.target.value)} 
                    className="customerInput"
                />
                <input 
                    type="text" 
                    placeholder="Phone Number" 
                    value={customerPhone} 
                    onChange={(e) => setCustomerPhone(e.target.value)} 
                    className="customerInput"
                />

                <button className="cashOutButton" onClick={handleCashOutClick}>Cash Out</button>
                <button className="cancelButton" onClick={onClose}>Close</button>
            </div>

            {/* Points Info Modal */}
            {showPointsModal && <PointsInfoModal pointsMessage={pointsMessage} onClose={handleClosePointsModal} />}
        </div>
    );
};

// Pop-up message for if the user tries to click 'View Order' but hasn't selected any items
const EmptyOrderModal = ({ onClose }) => {
    return (
        <div className="modal">
            <div className="modalContent">
                <h3>Please add at least one item to your order</h3>
                <button onClick={onClose} className="cancelButton">Close</button>
            </div>
        </div>
    );
};



export default function KioskView() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isTextToggle, setIsTextToggle] = useState(false);
    const [activeMenu, setActiveMenu] = useState('entrees');
    const [filters, setFilters] = useState({
        spicy: false,
        wokSmart: false,
        premium: false,
    });
    const [totalAmount, setTotalAmount] = useState(0);
    const [menuItems, setMenuItems] = useState({ sides: [], entrees: [], appetizers: [], desserts: [], drinks: [] });
    const [spicyEntrees, setSpicyEntrees] = useState([]);
    const [wokSmartEntrees, setWokSmartEntrees] = useState([]);
    const [promos, setPromos] = useState([]);
    const [premiumEntrees, setPremiumEntrees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [prices, setPrices] = useState({});
    const [comboPrices, setComboPrices] = useState({});
    const [info, setInfo] = useState({});
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showEmptyOrderModal, setShowEmptyOrderModal] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [comboState, setComboState] = useState(null);
    const [comboSelections, setComboSelections] = useState({ side: null, entrees: [] });
    const [comboPriceTotal, setComboPriceTotal] = useState(0);
    const [availability, setAvailability] = useState(false);
    
    const toggleTextSize = () => {
        setIsTextToggle((prevMode) => !prevMode);
    };

    useEffect(() => {
        if(isTextToggle){
            document.body.classList.add('large-text');
        } else {
            document.body.classList.remove('large-text');
        }
    }, [isTextToggle]);

    const toggleTheme = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };
    
    const toggleTts = () => {
        setTtsEnabled((prev) => !prev); // Toggle TTS state
    };

    useEffect(() => {
        if(isDarkMode){
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);


    useEffect(() => {
        const fetchAllAvailability = async () => {
            const availabilityMap = {};
            for (const item of menuItems[activeMenu] || []) {
                availabilityMap[item] = await fetchAvailability(item);
            }
            setAvailability(availabilityMap);
        };
        fetchAllAvailability();
    }, [menuItems, activeMenu]);

    useEffect(() => {
        const fetchData = async() => {
            try{
                await fetchPromos();
            } catch (err) {
                setError(err);
            }
        }
        fetchData();
    }, []);


    useEffect(() => {

        const fetchMenuItemData = async() => {
            try{
                await fetchMenuItems();
                await fetchSpicy();
                await fetchWokSmart();
                await fetchPremium();
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchMenuItemData();
    }, [promos]);

    //function with only the customer points aspect in the View Order
    const handleCashOut = async ({ customerName, customerEmail, customerPhone, totalAmount }) => {
        try {
            const response = await axios.post('/api/cashout', {
                name: customerName || '',
                email: customerEmail || '',
                phone_number: customerPhone || '',
                totalPrice: totalAmount
            });
            
            return response.data;
            
            
            
        } catch (error) {
            console.error('Error during cash-out:', error);
            alert('Cash-out failed. Please try again.');
        }
    };

    // Fetches all menu items and their prices, categorizes them by type
    const fetchMenuItems = async () => {
        try {
            const response = await axios.get('/api/menu');
            const data = response.data;

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
            const comboPricesData = {};
            for (const item of data.map(item => item.menu_item_name)) {
                const small = await fetchPrice(item, 'small');
                const medium = await fetchPrice(item, 'medium');
                const large = await fetchPrice(item, 'large');
                const bowl = await fetchPrice(item, 'bowl');
                const plate = await fetchPrice(item, 'plate');
                const bplate = await fetchPrice(item, 'bigger_plate');
                pricesData[item] = { small: Number(small), medium: Number(medium), large: Number(large) }; // Convert to numbers
                comboPricesData[item] = { bowl: Number(bowl), plate: Number(plate), bplate: Number(bplate)};
            }
            setPrices(pricesData);
            setComboPrices(comboPricesData);
            
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetches the menu items that are considered 'spicy'
    const fetchSpicy = async () => {
        try {
            const response = await axios.get('/api/spice');
            const data = response.data.map(item => item.menu_item_name);
            setSpicyEntrees(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetches the menu items that are considered 'wok smart' (lower calories)
    const fetchWokSmart = async () => {
        try {
            const response = await axios.get('/api/wok');
            const data = response.data.map(item => item.menu_item_name);
            setWokSmartEntrees(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetches the menu items that are considered 'premium'
    const fetchPremium = async () => {
        try {
            const response = await axios.get('/api/premium');
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
            const response = await axios.get(`/get-price/${item}/${size}`);
            let price = response.data.price || 0; // Default to 0 if price is undefined

            const promo = promos.find(promo => promo.menu_item_name === item);

            if (promo) { // If the menu item has an ongoing promotion, deduct the discount amount, but ensure price cannot go below 0
                price -= promo.discount_amount;
            }
            
            return price; 
        } catch (error) {
            console.error('Error fetching price:', error);
            return 0; // Default to 0 on error
        }
    };

    // Fetches availability of menu items based on current inventory quantity
    const fetchAvailability = async (name) => {
        try {
            const response = await axios.get(`/api/availability/${name}`);
            return response.data;
        } catch (err) {
            console.error('Error fetching availability:', err);
            return false; 
        }
    };

    // Fetches menu items with ongoing promotions (on sale)
    const fetchPromos = async () => {
        try {
            const response = await axios.get('/api/promos'); // Fetch weekly promos
            setPromos(response.data || []);
        } catch (err) {
            console.error('Error fetching promos:', err);
            setPromos([]);
        }
    };  

    const handleFilterChange = (filter) => {
        setFilters((prev) => ({
            ...prev,
            [filter]: !prev[filter],
        }));
    };
    

    //Pop-up for when you click on the 'info' icon
    const MenuItemInfo = ({name, description, allergens, calories, onClose}) => {
        const isSpicy = spicyEntrees.includes(name);
        const isWokSmart = wokSmartEntrees.includes(name);

        return (
            <div className="modal">
                <div className="modalContent">
                    <h3>{name}</h3>
                    <div className="infoItemImage">
                        <img src={`/images/${name}.avif`} alt={name}/>
                    </div>
                    <div className="iconWithInfo">
                        {isWokSmart && <img src={`/images/wok_smart_icon.avif`} alt="wok smart" className="w-11 h-11"/>}
                        {isWokSmart && <p><strong>Wok Smart: </strong> Wok Smart dishes have at least 8g of protein and 300 calories or less.</p>}
                    </div>
                    <div className="iconWithInfo">
                        {isSpicy && <img src={`/images/spicy_icon.avif`} alt="spicy" className="w-10 h-10"/>}
                        {isSpicy && <p><strong>Spicy: </strong> Can you handle the spice?</p>}
                    </div>
                    <p><strong>Description:</strong> {description || "No description available"}</p>
                    <p><strong>Allergens:</strong> {allergens.length > 0 ? allergens.join(', ') : "None specifies"}</p>
                    <p><strong>Calories:</strong> {calories} kcal</p>
                    <button onClick={onClose} className="cancelButton">Close</button>
                </div>
            </div>
        )
    }

    // Fetches additional menu item information such as description, allergens, and calories
    const fetchMenuItemInfo = async (item) => {
        try {
            const response = await axios.get(`/api/info/${item}`);
            if (response && response.data) {
                return response.data;
            } else {
                alert('No data returned from API');
                return null;
            }
        } catch (error) {
            alert('Error fetching menu item info:', error);
            return 0;
        }
    };

    // Updates the total as items get added to the order
    const addToTotal = (price, itemName, size) => {
        setTotalAmount(prevTotal => prevTotal + price);
        if(itemName != 'Bowl' && itemName != 'Plate' && itemName != 'Bigger Plate'){
            setOrderItems(prevItems => [...prevItems, { name: itemName, price }]); // Add item to order
        } else {
            setOrderItems(prevItems => [...prevItems, { name: itemName, price }]);
        }
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
    

    const handleMenuButtonClick = (menu) => {
        setActiveMenu(menu);
        if (menu !== "combo") {
            // Reset combo state if leaving the combo view
            setComboState(null);
            setComboSelections({ side: null, entrees: [] });
            setComboPriceTotal(0);
        }
    };

    // Handles when user selects a menu item
    const handleItemClick = (item) => {
        setSelectedItem(item);
        setShowSizeModal(true);
        if (ttsEnabled) {
            speakText(`You selected ${item}`);
        }
    };

    const handleInfoClick = async(item) => {
        setSelectedItem(item);
        const itemInfo = await fetchMenuItemInfo(item);

        if(itemInfo && itemInfo.length > 0){
            const itemData = itemInfo[0];

             // Ensure spicyEntrees, wokSmartEntrees, and premiumEntrees are accessible
            const isSpicy = spicyEntrees.includes(itemData.menu_item_name); // Check if item is spicy
            const isWokSmart = wokSmartEntrees.includes(itemData.menu_item_name); // Check if item is Wok Smart
            const isPremium = premiumEntrees.includes(itemData.menu_item_name); // Check if item is Premium

            setInfo({
                name: itemData.menu_item_name,
                description: itemData.menu_item_description,
                calories: itemData.menu_item_calories,
                allergens: itemData.allergens || []
            });
            setShowInfo(true);
            
            // Construct the text for TTS
            let speechText = `${itemData.menu_item_name}. `; // Name
            if (isSpicy) speechText += "This dish is spicy. ";
            if (isWokSmart) speechText += "This is a Wok Smart dish with at least 8 grams of protein and 300 calories or less. ";
            if (isPremium) speechText += "This is a premium dish. ";

            speechText += itemData.menu_item_description
                ? `Description: ${itemData.menu_item_description}. ` // Description
                : "No description available. ";

            speechText += `Allergens: ${
                itemData.allergens && itemData.allergens.length > 0
                    ? itemData.allergens.join(", ")
                    : "None specified"
            }. `;

            speechText += `Calories: ${itemData.menu_item_calories} kcal.`; // Calories

            // Trigger TTS if enabled
            if (ttsEnabled) {
                console.log("Triggering TTS with text:", speechText);

                speakText(speechText);
            }
        }
    }

    // Handles when user selects a size from the pop-up
    const handleSizeSelect = (price, size) => {
        addToTotal(price, selectedItem, size); // Pass the selected size
    };

    // Handles when user selects 'View Order'
    const handleViewOrder = () => {
        if (orderItems.length === 0) {
            setShowEmptyOrderModal(true); // Show empty order modal if no items
            if (ttsEnabled) {
                speakText('Your order is empty. Please add items to your order.');
            }
        } else {
            setShowOrderModal(true); // Show the order summary modal
            if (ttsEnabled) {
                speakText(`Your order total is ${totalAmount.toFixed(2)} dollars.`);
            }
        }
    };

    //COMBO LOGIC
    const handleComboTypeSelect = (type) => {
        setComboState(type);
        setComboSelections({ side: null, entrees: []});
        setComboPriceTotal(0);
    };
    
    //COMBO LOGIC
    const handleComboItemSelect = (type, item) => {
        if (type === 'side') {
            setComboSelections((prev) => ({...prev, side:item}));
        }

        if (type === 'entree') {
            setComboSelections((prev) => {
                const maxEntrees = comboState === 'bowl' ? 1 : comboState === 'plate' ? 2 : 3;
                const currentEntrees = [...prev.entrees];

                //Check if menu item is already selected, if so, remove all counts of it
                const itemCount = currentEntrees.filter((e) => e === item).length;

                if(itemCount > 0) {
                    const updatedEntrees = currentEntrees.filter((e) => e !== item);
                   
                    const redistributedEntrees = [];
                    if(updatedEntrees.length > 0) {
                        for(let i = 0; i < maxEntrees; i++) {
                            redistributedEntrees.push(updatedEntrees[i % updatedEntrees.length]);
                        }
                    }
                    return {...prev, entrees: redistributedEntrees};
                } else {
                    if(currentEntrees.length === 0) {
                        return {...prev, entrees: Array(maxEntrees).fill(item)};
                    } else if(currentEntrees.length < maxEntrees) {
                        return {...prev, entrees: [...currentEntrees, item]};
                    } else {
                        const updatedEntrees = [...currentEntrees];
                        updatedEntrees.shift();
                        updatedEntrees.push(item);
                        return {...prev, entrees: updatedEntrees};
                    }

                }
            });
        }
    };
    

    //Combo logic
    const calculateComboPrice = () => {
        let price = 0;

        if(comboSelections.side){
            price += comboPrices[comboSelections.side]?.[comboState.toLowerCase()] || 0;
        }

        comboSelections.entrees.forEach((entree) => {
            price += comboPrices[entree]?.[comboState.toLowerCase()] || 0;
        });

        console.log("Calculate combo price:", price);
        setComboPriceTotal(price);
    }  
    
    //Combo logic
    const addComboToOrder = () => {
        if (comboSelections.side && comboSelections.entrees.length === (comboState === 'bowl' ? 1 : comboState === 'plate' ? 2 : 3)) {
            //Determine the combo type string based on comboState to add to the order
            const comboType = comboState === 'bowl' ? 'Bowl' : comboState === 'plate' ? 'Plate' : 'Bigger Plate';
           
            //Add combo to the order
            addToTotal(comboPriceTotal, comboType);
            setOrderItems((prev) => {
                const newItems = [
                    {name: comboSelections.side, price: -1},
                    ...comboSelections.entrees.map((entree) => ({
                        name: entree,
                        price: -1
                    })),
                ];
                return [...prev, ...newItems];
            });

            // Reset combo info
            setComboState(null);
            setComboSelections({ side:null, entrees:[]});
            setComboPriceTotal(0);
        }
    }  

    useEffect(() => {
        calculateComboPrice();
    }, [comboSelections]);
    
    function translate() {
        const script = document.createElement('script');
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.type = 'text/javascript';
        document.head.append(script);
        window.googleTranslateElementInit = function() {
            try{
                new window.google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
            } catch (error) {
                console.log('Google Translate Error', error); 
            }
        };

    };
    
    useEffect(() => {
        if(loading == false){    
            translate();
        }
    }, [loading]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    // Filter menu items based on the selected filter
    const getFilteredMenuItems = () => {
        if (activeMenu !== 'entrees') return menuItems[activeMenu]; // No filter applied for non-entree menus
    
        // Apply filters
        let filtered = menuItems.entrees;
        if (filters.spicy) filtered = filtered.filter((item) => spicyEntrees.includes(item));
        if (filters.wokSmart) filtered = filtered.filter((item) => wokSmartEntrees.includes(item));
        if (filters.premium) filtered = filtered.filter((item) => premiumEntrees.includes(item));
    
        return filtered;
    };

    const filteredItems = getFilteredMenuItems();

    
    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            speechSynthesis.speak(utterance);
        } else {
            alert('Your browser does not support Text-to-Speech.');
        }
    };
    
    
    
    // Front end view
    return (
        <div className="kioskContainer">
            <div className="kioskAPIHeader">
                <div className="leftHeader">
                    <div id="google_translate_element"></div>
                </div>
                <div className="rightHeader">
                    {/* Large Text Toggle Button*/}
                    <button className="textSizeToggleButton" onClick={toggleTextSize}> <img src="/images/toggle_text_size_icon.png" alt="Toggle Text Icon" className="textIcon"/>
                        Toggle Text Size
                    </button>
                    {/* Light/Dark mode Toggle Button */}
                    <button className="themeToggleButton" onClick={toggleTheme}>
                        {isDarkMode ? (
                            <img 
                                src="/images/sun_icon.png" 
                                alt="Light Mode Icon" 
                                className="themeIcon" 
                            />
                        ) : (
                            <img 
                                src="/images/moon_icon.png" 
                                alt="Dark Mode Icon" 
                                className="themeIcon" 
                            />
                        )}
                        {isDarkMode ? ' Light Mode' : ' Dark Mode'}
                    </button>
                    {/* TTS Toggle Button */}
                    <div className="ttsToggle">
                        <button onClick={toggleTts} className={`ttsButton ${ttsEnabled ? 'enabled' : ''}`}>
                            <img src="/images/tts_icon.png" alt="TTS Icon" className="ttsIcon"/>
                            {ttsEnabled ? 'Disable TTS' : 'Enable TTS'}
                        </button>
                    </div>
                </div>
            </div>
            
            <h2 className="kioskHeader">Kiosk</h2>
            <div className="mainContent">
                {/* Sidebar Menu */}
                <div className="sidebar">
                    <button 
                        className={`menuButton ${activeMenu === "combo" ? "active" : ""}`}
                        onClick={() => handleMenuButtonClick("combo")}
                    >
                        Combo
                    </button>
                    {Object.keys(menuItems).map((menu) => (
                        <button
                            key={menu}
                            className={`menuButton ${activeMenu === menu ? 'active' : ""}`}
                            onClick={() => handleMenuButtonClick(menu)}
                        >
                            {menu.charAt(0).toUpperCase() + menu.slice(1)} {/* Capitalize menu name */}
                        </button>
                    ))}
                </div>


                {/* Main Content */}
                <div className="mainArea">
                {activeMenu === 'entrees' && (
    <div className="entreesSection">
        

        {/* Filter Buttons */}
        <div className="filterButtonsContainer">
            <label className={`filterButton ${filters.spicy ? 'active' : ''}`}>
                <input
                    type="checkbox"
                    className="filterCheckbox"
                    checked={filters.spicy}
                    onChange={() => handleFilterChange('spicy')}
                />
                Spicy
            </label>
            <label className={`filterButton ${filters.wokSmart ? 'active' : ''}`}>
                <input
                    type="checkbox"
                    className="filterCheckbox"
                    checked={filters.wokSmart}
                    onChange={() => handleFilterChange('wokSmart')}
                />
                Wok Smart
            </label>
            <label className={`filterButton ${filters.premium ? 'active' : ''}`}>
                <input
                    type="checkbox"
                    className="filterCheckbox"
                    checked={filters.premium}
                    onChange={() => handleFilterChange('premium')}
                />
                Premium
            </label>
        </div>

        {/* this works with the filter for entrees Filtered Entrees Grid */}
        <div className="itemsGrid">
            {filteredItems.map((item, index) => {
                const priceData = prices[item] || { small: 0, medium: 0, large: 0 };
                const priceToDisplay = formatPrices(priceData, item);

                const isSpicy = spicyEntrees.includes(item);
                const isWokSmart = wokSmartEntrees.includes(item);
                const isPremium = premiumEntrees.includes(item);
                const isOnSale = promos.some(promo => promo.menu_item_name === item);

                return (
                    <div key={index} className={`menuItem ${availability[item] === false ? 'disabled' : ''}`} onClick={() => availability[item] !== false && handleItemClick(item)}>
                        <div className="infoIcon" onClick={(e) => {
                            e.stopPropagation();
                            handleInfoClick(item);
                        }}>
                            <img src={`/images/info_icon.png`} alt="info" className="w-8 h-8" />
                            {isOnSale && <img src={`/images/sale_icon.avif`} alt="sale" className="w-12 h-12" />}
                        </div>
                        <div className="itemImage">
                            <img src={`/images/${item}.avif`} alt={item} />
                        </div>
                        <div className="icon">
                            {isPremium && <img src={`/images/premium_icon.avif`} alt="premium" className="w-20 h-10 mr-10" />}
                            {isWokSmart && <img src={`/images/wok_smart_icon.avif`} alt="wok smart" className="w-10 h-10" />}
                            {isSpicy && <img src={`/images/spicy_icon.avif`} alt="spicy" className="w-9 h-9" />}
                        </div>
                        <span className="itemName">{item}</span>
                        <span className="itemPrice">{priceToDisplay || 'N/A'}</span>
                    </div>
                );
            })}
        </div>
    </div>
)}
    {['appetizers', 'desserts', 'drinks', 'sides'].includes(activeMenu) && (
    <div className={`${activeMenu}Section`}>


        {/* Grid of Items */}
        <div className="itemsGrid">
            {menuItems[activeMenu]?.map((item, index) => {
                const priceData = prices[item] || { small: 0, medium: 0, large: 0 };
                const priceToDisplay = formatPrices(priceData, item);

                const isSpicy = spicyEntrees.includes(item);
                const isWokSmart = wokSmartEntrees.includes(item);
                const isPremium = premiumEntrees.includes(item);
                const isOnSale = promos.some(promo => promo.menu_item_name === item);

                return (
                    <div key={index} className={`menuItem ${availability[item] === false ? 'disabled' : ''}`} onClick={() => availability[item] !== false && handleItemClick(item)}>
                        <div className="infoIcon" onClick={(e) => {
                            e.stopPropagation();
                            handleInfoClick(item);
                        }}>
                            <img src={`/images/info_icon.png`} alt="info" className="w-8 h-8" />
                            {isOnSale && <img src={`/images/sale_icon.avif`} alt="sale" className="w-12 h-12" />}
                        </div>
                        <div className="itemImage">
                            <img src={`/images/${item}.avif`} alt={item} />
                        </div>
                        <div className="icon">
                            {isPremium && <img src={`/images/premium_icon.avif`} alt="premium" className="w-20 h-10 mr-10" />}
                            {isWokSmart && <img src={`/images/wok_smart_icon.avif`} alt="wok smart" className="w-10 h-10" />}
                            {isSpicy && <img src={`/images/spicy_icon.avif`} alt="spicy" className="w-9 h-9" />}
                        </div>
                        <span className="itemName">{item}</span>
                        <span className="itemPrice">
                            {isOnSale ? (
                                <>{"(SALE -$" + promos.find(promo => promo.menu_item_name === item)?.discount_amount.toFixed(2) + ")"}</>
                            ) : null}
                        </span>
                        <span className="itemPrice">{priceToDisplay || 'N/A'}</span>
                    </div>
                );
            })}
        </div>
    </div>
)}



                    {activeMenu === "combo" && (
                        <div className="comboView">
                            <div className="buttonContainer">
                                <button className="comboButton" onClick={() => handleComboTypeSelect("bowl")}>
                                    Bowl <img src={`/images/${isDarkMode ? "bowl_icon_dark.png" : "bowl_icon.png"}`} alt="bowl icon" />
                                </button>
                                <button className="comboButton" onClick={() => handleComboTypeSelect("plate")}>
                                    Plate <img src={`/images/${isDarkMode ? "plate_icon_dark.png" : "plate_icon.png"}`} alt="plate icon" />
                                </button>
                                <button className="comboButton" onClick={() => handleComboTypeSelect("bplate")}>
                                    Bigger Plate <img src={`/images/${isDarkMode ? "bplate_icon_dark.png" : "bplate_icon.png"}`} alt="bplate icon" />
                                </button>
                            </div>
                            
                            {comboState && (
                                <div className="comboSelections">
                                    <h2 className="comboName">
                                        {comboState === "bowl" && "Bowl"}
                                        {comboState === "plate" && "Plate"}
                                        {comboState === "bplate" && "Bigger Plate"}
                                    </h2>
                                    <div className="comboDescription">
                                        {comboState === "bowl" && (<>Choose 1 side and 1 entree <br /> Starting at $8.30</>)}
                                        {comboState === "plate" && (<>Choose 1 side and 2 entrees <br /> Starting at $9.80</>)}
                                        {comboState === "bplate" && (<>Choose 1 side and 3 entrees <br /> Starting at $11.30</>)}
                                    </div>


                                    {/* Side Selection */}
                                    <h2 className="comboSteps">Side Selection</h2>


                                    {/* I need this for combo main items  Grid of Sides */}
                                    <div className="itemsGrid">
                                        {menuItems["sides"]?.map((item, index) => {
                                            const comboPriceData = comboPrices[item] || { bowl: 0, plate: 0, bplate: 0 };
                                            const priceToDisplay = formatPrices(comboPriceData, item);

                                            const isSpicy = spicyEntrees.includes(item);
                                            const isWokSmart = wokSmartEntrees.includes(item);
                                            const isPremium = premiumEntrees.includes(item);
                                            const isOnSale = promos.some(promo => promo.menu_item_name === item);

                                            return (
                                                <div key={index} className={`menuItem 
                                                    ${comboSelections.side === item || comboSelections.entrees.includes(item) ? 'selected' : ''} 
                                                    ${availability[item] === false ? 'disabled' : ''}`} 
                                                    onClick={() => handleComboItemSelect('side', item)}
                                                >
                                                    
                                                    <div className="infoIcon" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleInfoClick(item);
                                                    }}>
                                                        <img src={`/images/${isDarkMode ? "info_icon_dark.png" : "info_icon.png"}`} alt="info" className="w-8 h-8" />
                                                        {isOnSale && <img src={`/images/sale_icon.avif`} alt="sale" className="w-12 h-12" />}
                                                    </div>
                                                    <div className="itemImage">
                                                        <img src={`/images/${item}.avif`} alt={item} />
                                                    </div>
                                                    <div className="icon">
                                                        {isPremium && <img src={`/images/premium_icon.avif`} alt="premium" className="w-20 h-10 mr-10" />}
                                                        {isWokSmart && <img src={`/images/wok_smart_icon.avif`} alt="wok smart" className="w-10 h-10" />}
                                                        {isSpicy && <img src={`/images/spicy_icon.avif`} alt="spicy" className="w-9 h-9" />}
                                                    </div>
                                                    <span className="itemName">{item}</span>
                                                    <span className="itemPrice">
                                                        {isOnSale ? (
                                                            <>{"-$" + promos.find(promo => promo.menu_item_name === item)?.discount_amount.toFixed(2)}</>
                                                        ) : null}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    
                                    <div className="filterButtonsContainer">
                                        <label className={`filterButton ${filters.spicy ? 'active' : ''}`}>
                                            <input
                                                type="checkbox"
                                                className="filterCheckbox"
                                                checked={filters.spicy}
                                                onChange={() => handleFilterChange('spicy')}
                                            />
                                            Spicy
                                        </label>
                                        <label className={`filterButton ${filters.wokSmart ? 'active' : ''}`}>
                                            <input
                                                type="checkbox"
                                                className="filterCheckbox"
                                                checked={filters.wokSmart}
                                                onChange={() => handleFilterChange('wokSmart')}
                                            />
                                            Wok Smart
                                        </label>
                                        <label className={`filterButton ${filters.premium ? 'active' : ''}`}>
                                            <input
                                                type="checkbox"
                                                className="filterCheckbox"
                                                checked={filters.premium}
                                                onChange={() => handleFilterChange('premium')}
                                            />
                                            Premium
                                        </label>
                                    </div>

                                    {/* Entree Selection */}
                                    <h2 className="comboSteps">Entree Selection</h2>
                                   
                                    {/* I need this for entrees in combo Grid of Entrees */}
                                    <div className="itemsGrid">
                                        {menuItems["entrees"]?.filter(item => {
                                            // Apply filters
                                            if (filters.spicy && !spicyEntrees.includes(item)) return false;
                                            if (filters.wokSmart && !wokSmartEntrees.includes(item)) return false;
                                            if (filters.premium && !premiumEntrees.includes(item)) return false;
                                            return true;
                                        }).map((item, index) => {
                                            const comboPriceData = comboPrices[item] || { bowl: 0, plate: 0, bplate: 0 };
                                            const priceToDisplay = formatPrices(comboPriceData, item);

                                            const isSpicy = spicyEntrees.includes(item);
                                            const isWokSmart = wokSmartEntrees.includes(item);
                                            const isPremium = premiumEntrees.includes(item);
                                            const isOnSale = promos.some(promo => promo.menu_item_name === item);

                                            return (
                                                <div key={index} className={`menuItem 
                                                    ${comboSelections.side === item || comboSelections.entrees.includes(item) ? 'selected' : ''} 
                                                    ${availability[item] === false ? 'disabled' : ''}`} 
                                                    onClick={() => handleComboItemSelect('entree', item)}
                                                >
                                                    
                                                    <div className="infoIcon" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleInfoClick(item);
                                                    }}>
                                                        <img src={`/images/info_icon.png`} alt="info" className="w-8 h-8" />
                                                        {isOnSale && <img src={`/images/sale_icon.avif`} alt="sale" className="w-12 h-12" />}
                                                    </div>
                                                    <div className="itemImage">
                                                        <img src={`/images/${item}.avif`} alt={item} />
                                                    </div>
                                                    <div className="icon">
                                                        {isPremium && <img src={`/images/premium_icon.avif`} alt="premium" className="w-20 h-10 mr-10" />}
                                                        {isWokSmart && <img src={`/images/wok_smart_icon.avif`} alt="wok smart" className="w-10 h-10" />}
                                                        {isSpicy && <img src={`/images/spicy_icon.avif`} alt="spicy" className="w-9 h-9" />}
                                                    </div>
                                                    <span className="itemName">{item}</span>
                                                    <span className="itemPrice">
                                                        {isPremium && "+$1.50"}
                                                    </span>
                                                    <span className="itemPrice">
                                                        {isOnSale ? (
                                                            <>{"-$" + promos.find(promo => promo.menu_item_name === item)?.discount_amount.toFixed(2)}</>
                                                        ) : null}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="addComboButtonContainer">
                                    <button
                                        className={`addComboToOrderButton ${!comboSelections.side || comboSelections.entrees.length !== (comboState === "bowl" ? 1 : comboState === "plate" ? 2 : 3) ? 'disabled' : ''}`}
                                        onClick={addComboToOrder}
                                        disabled={
                                            !comboSelections.side ||
                                            comboSelections.entrees.length !== (comboState === "bowl" ? 1 : comboState === "plate" ? 2 : 3)
                                        }
                                    >
                                        {(!comboSelections.side || comboSelections.entrees.length !== (comboState === "bowl" ? 1 : comboState === "plate" ? 2 : 3)) ? 
                                            'Please make your selections' :
                                            `Add to Order: $${comboPriceTotal.toFixed(2)}`}
                                    </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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

            {/* Info Selection */}               
            {showInfo && selectedItem && (
                <MenuItemInfo
                    name = {info.name}
                    description = {info.description}
                    calories = {info.calories}
                    allergens = {info.allergens}
                    onClose = {() => setShowInfo(false)}
                />
            )}

            {/* Order Summary Modal */}
            {showOrderModal && (
                <OrderSummaryModal
                    orderItems={orderItems}
                    totalAmount={totalAmount}
                    onClose={() => setShowOrderModal(false)}
                    onCashOut={handleCashOut}
                    setOrderItems={setOrderItems}
                    setTotalAmount={setTotalAmount}
                    setShowOrderModal={setShowOrderModal}
                />
            )}

            {/* Empty Order Modal */}
            {showEmptyOrderModal && (
                <EmptyOrderModal
                    onClose={() => setShowEmptyOrderModal(false)}
                />
            )}
        </div>
        </div>
)

}
