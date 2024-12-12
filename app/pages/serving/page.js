/**
 * Serving View Component
 * 
 * @description This component fetches and displays the status of orders in the panda express system.
 * It categorizes orders into "Awaiting", "In Progress", and "Complete". It also manages a timer
 * for "Complete" orders, removing them after 10 minutes. Orders are periodically fetched and updated.
 * 
 * @author Emily Abraham
 */

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./serving.css";



axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = "http://localhost:5000";

/**
 * OrderStatusPage component displays the status of orders in a restaurant system.
 * It fetches order data from the backend, organizes orders by status (Awaiting, In Progress, Complete),
 * and displays them in a table. It also starts a timer for "Complete" orders, removing them after 10 minutes.
 */
export default function OrderStatusPage() {
    const [orders, setOrders] = useState([]); // Holds the list of orders
    const [error, setError] = useState(null); // Holds error message
    const [completeTimers, setCompleteTimers] = useState({}); // Track timers for complete orders

    /**
     * Fetches the current order status from the backend.
     * It updates the state with newly fetched orders and manages the timer for "Complete" orders.
     */
    async function fetchOrdersStatus() {
        try {
            const response = await axios.get("/api/orders-status");
            const newOrders = response.data;

            // Add timestamps for orders that are newly completed
        const updatedOrders = newOrders.map((order) => {
            if (order.order_status === "Complete" && !order.completedAt) {
                return { ...order, completedAt: Date.now() };
            }
            return order;
        });

        // Start timers for new Complete orders
        updatedOrders.forEach((order) => {
            if (
                order.order_status === "Complete" &&
                !completeTimers[order.order_id]
            ) {
                const timerId = setTimeout(
                    () => removeCompleteOrder(order.order_id),
                    10 * 60 * 1000 // 10 minutes
                );

                setCompleteTimers((prev) => ({
                    ...prev,
                    [order.order_id]: timerId,
                }));
            }
        });

        // Update the orders state with the latest "Complete" orders at the top
        setOrders((prevOrders) => {
            const orderMap = new Map(prevOrders.map((order) => [order.order_id, order]));

            // Merge updated orders into the map
            updatedOrders.forEach((order) => {
                orderMap.set(order.order_id, order);
            });

            // Convert the map back to an array
            const mergedOrders = Array.from(orderMap.values());
                
            // Separate completed and non-completed orders
            const completedOrders = mergedOrders.filter(
                (order) => order.order_status === "Complete"
            );
            const nonCompletedOrders = mergedOrders.filter(
                (order) => order.order_status !== "Complete"
            );

            // Sort completed orders by timestamp and add them at the top
            const sortedCompletedOrders = completedOrders.sort(
                (a, b) => b.completedAt - a.completedAt // Most recent on top
            );

            return [...sortedCompletedOrders, ...nonCompletedOrders];
        });
    } catch (err) {
        console.error("Failed to fetch order status:", err.message);
        setError("Failed to fetch order status");
        }
    }

    /**
     * Removes a completed order from the state after the timer expires.
     * @param {number} orderId - The ID of the order to remove.
     */
    function removeCompleteOrder(orderId) {
        setOrders((prevOrders) =>
            prevOrders.filter((order) => order.order_id !== orderId)
        );
        setCompleteTimers((prevTimers) => {
            const { [orderId]: _, ...remainingTimers } = prevTimers;
            return remainingTimers;
        });
    }

    /**
     * UseEffect hook to fetch orders periodically and manage cleanup on unmount.
     * It fetches the initial orders and sets up a 5-second interval for updates.
     */
    useEffect(() => {
        fetchOrdersStatus(); // Initial fetch
        const intervalId = setInterval(fetchOrdersStatus, 5000); // Refresh every 5 seconds

        // Cleanup intervals and timers on component unmount
        return () => {
            clearInterval(intervalId);
            Object.values(completeTimers).forEach(clearTimeout);
        };
    }, [completeTimers]);

    // Split orders into categories based on status
    const awaitingOrders = orders.filter((order) => order.order_status === "Awaiting");
    const inProgressOrders = orders.filter((order) => order.order_status === "In Progress");
    const completeOrders = orders.filter((order) => order.order_status === "Complete");

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="orderStatusContainer">
            <h1 className="orderStatusHeader"></h1>
            <div className="orderStatusTableContainer">
                <table className="orderStatusTable">
                    <thead>
                        <tr>
                            <th>
                                Awaiting
                                <div className="subtext">In Queue</div>
                            </th>
                            <th>
                                In Progress
                                <div className="subtext">In The Kitchen</div>
                            </th>
                            <th>
                                Complete
                                <div className="subtext">Order Is Ready For Pickup</div>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>
                                {awaitingOrders.map((order) => (
                                    <div key={order.order_id} className="status-awaiting">
                                        {order.order_id}
                                    </div>
                                ))}
                            </td>
                            <td>
                                {inProgressOrders.map((order) => (
                                    <div key={order.order_id} className="status-in-progress">
                                        {order.order_id}
                                    </div>
                                ))}
                            </td>
                            <td>
                                {completeOrders.slice(-20) // Only take the last 20 orders
                                .reverse()
                                .map((order) => (
                                    <div key={order.order_id} className="status-complete">
                                        {order.order_id}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
