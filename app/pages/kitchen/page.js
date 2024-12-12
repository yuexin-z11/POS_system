/**
 * KitchenView Component
 * 
 * This component represents the kitchen's view of pending orders. It allows users to 
 * see orders, start timers for each order, and update the order status (marking it 
 * as "In Progress" or "Complete"). The component fetches the initial list of pending 
 * orders from the backend API and displays them in a grid layout. Each order has an 
 * associated timer that counts down from 10 minutes. The main goal of this component
 * is to allow employees to see customer orders and combine the order to give to the customers.
 * @author Emily abraham
 * @component
 * @example
 * return (
 *   <KitchenView />
 * )
 */

"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './kitchenview.css';



axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';


/**
 * KitchenView component that displays the list of pending orders, allows status updates,
 * and manages timers for each order.
 *
 * @component
 * @example
 * return (
 *   <KitchenView />
 * )
 */

export default function KitchenView() {
    // State hooks to manage orders, the number of orders left, and timers
    const [orders, setOrders] = useState([]);
    const [ordersLeft, setOrdersLeft] = useState(0);
    const [timers, setTimers] = useState({}); // Track timers for each order

    /**
     * UseEffect hook that fetches initial orders when the component mounts.
     */
    useEffect(() => {
        fetchInitialOrders();
    }, []);
    /**
     * Fetches the list of pending orders from the server and updates state.
     * 
     * This function also sets the initial number of orders to display (6) and tracks
     * the total number of orders left in the queue.
     *
     * @async
     * @function fetchInitialOrders
     * @returns {void}
     */

    async function fetchInitialOrders() {
        try {
            const response = await axios.get('/api/pending-orders');
            const ordersData = response.data.orders;
            setOrders(ordersData.slice(0, 6));
            setOrdersLeft(ordersData.length);
        } catch (error) {
            console.error('Failed to fetch initial orders:', error.message);
        }
    }

    /**
     * Handles the status update for an order (either "In Progress" or "Complete").
     * 
     * This function sends a request to update the order status and modifies the local
     * state accordingly, updating the displayed order status and the list of pending orders.
     *
     * @async
     * @function handleStatusChange
     * @param {number} orderId - The ID of the order to update.
     * @param {string} newStatus - The new status to set for the order (either "In Progress" or "Complete").
     * @returns {void}
     */
    async function handleStatusChange(orderId, newStatus) {
        try {
            await axios.put(`/api/order-status/${orderId}`, { newStatus });
            console.log(`Order status updated to ${newStatus} for order ID: ${orderId}`);

            if (newStatus === 'In Progress') {
                setOrders((prevOrders) =>
                    prevOrders.map(order =>
                        order.order_id === orderId ? { ...order, order_status: 'In Progress' } : order
                    )
                );
            } else if (newStatus === 'Completed') {
                setOrders((prevOrders) => prevOrders.filter(order => order.order_id !== orderId));
                setOrdersLeft(prevCount => Math.max(0, prevCount - 1));

                const response = await axios.get('/api/pending-orders');
                const newOrdersData = response.data.orders;

                const existingOrderIds = new Set(orders.map(order => order.order_id));
                const uniqueNewOrders = newOrdersData.filter(order => !existingOrderIds.has(order.order_id));

                setOrders((prevOrders) => [
                    ...prevOrders,
                    ...uniqueNewOrders.slice(0, 6 - prevOrders.length),
                ]);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Please try again.');
        }
    }


    /**
     * Starts a countdown timer for a specific order. This function creates a timer that 
     * counts down from 10 minutes and updates the order's remaining time. If the timer 
     * reaches zero, it stops the countdown.
     *
     * @function startTimer
     * @param {number} orderId The ID of the order for which the timer is being started.
     * @returns {void}
     */
    function startTimer(orderId) {
        if (timers[orderId]) return; // If timer already exists, don't create another

        const endTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        const intervalId = setInterval(() => {
            const timeLeft = endTime - Date.now();

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.order_id === orderId
                        ? { ...order, timer: Math.max(0, timeLeft) }
                        : order
                )
            );

            if (timeLeft <= 0) {
                clearInterval(intervalId);
                setTimers((prevTimers) => {
                    const { [orderId]: _, ...remainingTimers } = prevTimers;
                    return remainingTimers;
                });
            }
        }, 1000);

        setTimers((prevTimers) => ({ ...prevTimers, [orderId]: intervalId }));
    }

    /**
     * Formats the remaining time (in milliseconds) into a readable string format of mm:ss.
     *
     * @function formatTime
     * @param {number} milliseconds The time remaining in milliseconds.
     * @returns {string}  The formatted time string in mm:ss format.
     */
    function formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    return (
        <div className="kitchenContainer">
            <h2 className="kitchenHeader">Kitchen</h2>
            <div className="cardGrid">
                {orders.map((order) => (
                    <div

                    className={`card ${
                        order.order_status === "In Progress" ? "in-progress" : ""
                    } ${order.timer === 0 ? "timer-expired" : ""}`}
                    key={order.order_id}
                >
                        <div className={`card-header ${order.order_status === "In Progress" ? "in-progress-header" : ""}`}>

                            <div className="header-content">
                                <h3>Order ID: #{order.order_id}</h3>
                            </div>
                            <button
                                className="btn btn-timer"
                                onClick={() => startTimer(order.order_id)}
                            >
                                Start Timer
                            </button>
                        </div>
                        <div className="card-content">
                            {order.items ? order.items.split('\n').map((item, idx) => (
                                <p key={idx}>{item}</p>
                            )) : <p>No items found</p>}
                        </div>
                        <div className="card-timer">
                            {order.timer !== undefined && (
                                <p>
                                    Time Left:{" "}
                                    {order.timer > 0
                                        ? formatTime(order.timer)
                                        : "Time Expired!"}
                                </p>
                            )}
                        </div>
                        <div className="card-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleStatusChange(order.order_id, 'In Progress')}
                            >
                                In Progress
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleStatusChange(order.order_id, 'Completed')}
                            >
                                Complete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="queueBox">
                Orders in Queue: {Math.max(0, ordersLeft - 6)}
            </div>
        </div>
    );
    
}
