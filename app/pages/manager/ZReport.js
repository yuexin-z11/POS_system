/**
 * Z-Report Component for Daily Sales Reporting
 * 
 * @author Sonika Madhu
 
 * @description Component for generating and displaying daily sales reports

 */

import React, { useState, useEffect } from 'react';
import styles from './ZReport.module.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

/**
 * Custom alert modal for displaying messages.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.message - Message to display in the alert
 * @param {Function} props.onClose - Callback to close the alert
 * @returns {JSX.Element} Custom alert modal
 */
const CustomAlert = ({ message, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modalAlert}>
        <h3>{message}</h3>
        <button className={styles.closeButtonAlert} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
/**
 * Z-Report component for generating and displaying daily sales reports.
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onClose - Callback to close the Z-Report modal
 * @returns {JSX.Element} Z-Report modal with sales information
 */
const ZReport = ({ onClose }) => {
  /**
   * State variables for managing report data and UI state.
   */
  const [date, setDate] = useState('');
  const [orders, setOrders] = useState([]);
  const [dailyTotal, setDailyTotal] = useState(0.0);
  const [reportGeneratedDates, setReportGeneratedDates] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  /**
   * Load previously generated report dates from local storage on component mount.
   */
  useEffect(() => {
    // Load previously generated report dates from local storage on mount
    const savedDates = JSON.parse(localStorage.getItem('reportGeneratedDates')) || [];
    setReportGeneratedDates(savedDates);
  }, []);

  /**
   * Fetches orders for a specific date from the backend.
   * 
   * @param {string} dateInput - Date to fetch orders for
   * @async
   */
  const fetchOrders = async (dateInput) => {
    try {
      const formattedDate = new Date(dateInput).toISOString().split('T')[0];
      const response = await axios.get(`/api/zreport?date=${formattedDate}`);
      
      const data = response.data;
      setOrders(data.orders);
      setDailyTotal(data.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  /**
   * Generates a Z-Report for the selected date.
   * Validates date selection and prevents duplicate report generation.
   */
  const generateReport = () => {
    if (!date) {
      alert('Please select a date.');
      return;
    }

    const formattedDate = new Date(date).toISOString().split('T')[0];
    if (reportGeneratedDates.includes(formattedDate)) {
      setAlertMessage('Z-Report has already been generated for this date.');
      setShowAlert(true);
      return;
    }

    fetchOrders(date);
    const updatedDates = [...reportGeneratedDates, formattedDate];
    setReportGeneratedDates(updatedDates);
    localStorage.setItem('reportGeneratedDates', JSON.stringify(updatedDates));
  };
  /**
   * Handles closing the day by resetting daily total and orders.
   */
  const handleCloseDay = () => {
    setDailyTotal(0);
    setOrders([]);
    alert('Day closed. Total reset to zero.');
    onClose();
  };

  /**
   * Closes the alert modal.
   */
  const closeAlert = () => {
    setShowAlert(false);
  };


  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
  
        <h2>Z-Report (Daily Summary)</h2>
  
        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
  
        <button className={styles.generateReportButton} onClick={generateReport}>
          Generate Report
        </button>
  
        {orders.length > 0 && (
          <div className={styles.reportContent}>
            <h3>Total Sales: ${dailyTotal.toFixed(2)}</h3>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Price ($)</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td className={styles.centeredCell}>{order.order_id}</td>
                    <td className={styles.centeredCell}>{order.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
  
        <button className={styles.closeDayButton} onClick={handleCloseDay}>
          Close Day
        </button>
      </div>
  
      {showAlert && <CustomAlert message={alertMessage} onClose={closeAlert} />}
    </div>
  );
  
};

export default ZReport;