"use client";


import React, { useState } from 'react';


function RightPanel({ addItemToOrder }) { // Accept addItemToOrder function as a prop
    const [orderItems, setOrderItems] = useState([]);


    // Handle adding an item to the order
    const handleAddItemToOrder = (item) => {
        setOrderItems((prevItems) => [...prevItems, item]);
        if (addItemToOrder) {
            addItemToOrder(item); // Call the function passed from parent
        }
    };


    // Calculate total price (assuming each item is an object with a `price` field)
    const totalPrice = orderItems.reduce((total, item) => total + item.price, 0);


    return (
        <div className="right-panel">
            <h2>Order Summary</h2>
            <div className="order-summary">
                {orderItems.length > 0 ? (
                    orderItems.map((item, index) => (
                        <div key={index} className="order-item">
                            {item.name} - ${item.price.toFixed(2)} {/* Assuming item has name and price */}
                        </div>
                    ))
                ) : (
                    <p>No items in the order.</p>
                )}
            </div>
            <div className="total-price">Total: ${totalPrice.toFixed(2)}</div>
            <button onClick={() => console.log("Cash Out")} className="cash-out-button">
                Cash Out
            </button>
        </div>
    );
}


export default RightPanel;





