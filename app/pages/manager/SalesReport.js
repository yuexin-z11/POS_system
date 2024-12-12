/**
 
 * @description React component for generating and displaying sales reports. 
 *              It allows users to select a date range, view sales data in a bar chart, 
 *              and delete specific order items. The component fetches data from the backend API.
 * @author Sonika Madhu
 * @author Yuexin Zhang
 */

import React, { useState } from 'react';
import axios from 'axios';
import styles from './SalesReport.module.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registering required chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';  

/**
 * SalesReport component displays a sales report and handles operations like fetching sales data 
 * and deleting specific menu items within an order.
 * @param {Object} props - The component props.
 * @param {function} props.onClose - Function to close the SalesReport modal.
 */
const SalesReport = ({ onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const savedOrderId = sessionStorage.getItem('orderId') || '';
  const [orderId, setOrderId] = useState(savedOrderId);
  const [itemIdToDelete, setItemIdToDelete] = useState('');
  const [isOrderIdModalOpen, setIsOrderIdModalOpen] = useState(false);
  const [isMenuItemsModalOpen, setIsMenuItemsModalOpen] = useState(false);

  /**
   * Fetches the sales report for the selected date range.
   * Shows an alert if the start or end date is missing.
   */
  const fetchSalesReport = async () => {
    if (!startDate || !endDate) {
      setAlertMessage('Please enter both start and end dates.');
      setShowAlert(true);
      return;
    }

    try {
      const response = await axios.get('/api/salesreport', {
        params: {
          startDate,
          endDate,
        },
      });
      setMenuItems(response.data.menuItems);
    } catch (error) {
      console.error('Error fetching sales report:', error.message);
      setAlertMessage('Error fetching sales data.');
      setShowAlert(true);
    }
  };
  /** Closes the alert message. */
  const closeAlert = () => setShowAlert(false);

  // Prepare data for the bar chart
  const chartData = {
    labels: menuItems.map(item => item.name), // Menu item names
    datasets: [
      {
        label: 'Menu Item Sales',
        data: menuItems.map(item => item.count), // Menu item counts
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Sales Report: Menu Item Sales',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };
  /** Opens the Order ID modal and closes the Menu Items modal. */
  const openOrderIdModal = () => {
    setIsOrderIdModalOpen(true);
    setIsMenuItemsModalOpen(false);
  };
  /** Closes the Order ID modal and opens the Menu Items modal. */
  const closeOrderIdModal = () => {
    setIsOrderIdModalOpen(false);
    setIsMenuItemsModalOpen(true);
  };
  /** Opens the Menu Items modal and closes the Order ID modal. */
  const openMenuItemsModal = () => {
    setIsMenuItemsModalOpen(true);
    setIsOrderIdModalOpen(false);
  };
  /** Closes the Menu Items modal and resets related state variables. */
  const closeMenuItemsModal = () => {
    setIsMenuItemsModalOpen(false);
    setItemIdToDelete('');
    setOrderId('');
    setMenuItems([]);
  };

  /**
   * Fetches menu items for a specific order ID.
   * Shows an alert if the order ID is missing.
   */
  const fetchMenuItems = async () => {
    if (!orderId) {
      setAlertMessage('Please enter a valid Order ID.');
      setShowAlert(true);
      return;
    }

    try {
      const response = await axios.get(`/api/order-items/${orderId}`);
      console.log(response.data); // Log the response to check the data
      setMenuItems(response.data.menuItems);
      closeOrderIdModal(); // Close Order ID modal once menu items are fetched
      openMenuItemsModal(); // Open Menu Items modal
    } catch (error) {
      console.error('Error fetching menu items:', error);
      alert('Error fetching menu items.');
      closeMenuItemsModal();
      closeOrderIdModal();
    }
 };

  /**
   * Deletes a specific menu item from the order.
   * Shows alerts if the order ID or item is not selected.
   */
  const handleDeleteMenuItem = async () => {
    if (!orderId) {
      alert('Please select the order ID.');
      return;
    }
    if (!itemIdToDelete) {
      alert('Please select the item.')
      return;
    }

    try {
      const response = await axios.delete('/api/delete-order-item', {
        headers: {
          'Content-Type': 'application/json', // Explicitly set the header
        },
        data: { orderId: orderId, menu_item_id: itemIdToDelete },
      });
      console.log('Menu item deleted:', response.data);
      alert('Menu item deleted successfully!');
      closeMenuItemsModal(); // Close the Menu Items modal (if you have this function)
    } catch (error) {
      console.error('Error deleting menu item:', error.response ? error.response.data : error.message);
      alert('Failed to delete menu item.');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>

        <h2>Sales Report</h2>
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button onClick={fetchSalesReport} className={styles.generateReportButton}>
          Generate Report
        </button>

        <button onClick={openOrderIdModal} className={styles.generateReportButton}>
          Delete From Order
        </button>

        {!isMenuItemsModalOpen && menuItems.length > 0 && (
          <div className={styles.reportContent}>
            {/* Bar Chart for Sales Report */}
            <div className={styles.chartContainer}>
              <Bar data={chartData} options={chartOptions} />
            </div>

            {/* Sales Report table */}
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Menu Item</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showAlert && <div className={styles.modalAlert}>{alertMessage}</div>}      </div>
        {/* Order ID Modal */}
        {isOrderIdModalOpen && (
          <div className={styles.deleteModalOverlay}>
            <div className={styles.deleteModal}>
              <h3>Please enter the ID of the order from which you would like to remove:</h3>
              <input
                type="number"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)} // Update state when order ID is entered
                placeholder="Order ID"
              />
              <div className={styles.modalActions}>
                <button onClick={fetchMenuItems} className={styles.deleteButton}>
                  Continue
                </button>
                <button onClick={closeOrderIdModal} className={styles.closeModalButton}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items Modal */}
        {isMenuItemsModalOpen && (
        <div className={styles.deleteModalOverlay}>
          <div className={styles.deleteModal}>
            <h3>Select Menu Item to Delete</h3>
            <ul>
              {menuItems.map((item) => (
                <li key={item.menu_item_id}> 
                  <label>
                    <input
                      type="radio"
                      name="itemToDelete"
                      value={item.menu_item_id} 
                      onChange={(e) => setItemIdToDelete(e.target.value)}  
                    />
                    {item.menu_item_name} 
                  </label>
                </li>
              ))}
            </ul>
            <div className={styles.modalActions}>
              <button onClick={handleDeleteMenuItem} className={styles.deleteButton}>
                Delete Item
              </button>
              <button onClick={closeMenuItemsModal} className={styles.closeModalButton}>
                Back
              </button>
            </div>
          </div>
        </div>
        )}
    </div>
  );
};

export default SalesReport;
