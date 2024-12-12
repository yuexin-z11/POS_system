/**
 * XReport Component
 * 
 * This component renders the X-Report for hourly sales. It allows the user to select a 
 * date and generate a report that shows hourly sales data in both a chart and table format.
 * If no date is selected, an alert is displayed asking the user to select a date.
 * 
 * @author Sonika Madhu
 * Date: December 2024
 * 
 * @component
 */
import React, { useState, useEffect } from 'react';
import styles from './XReport.module.css';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000'; 

/**
 * CustomAlert Component
 * 
 * Displays a modal alert message.
 * 
 * @component
 * @param {Object} props - The properties for the alert.
 * @param {string} props.message - The message to display in the alert.
 * @param {function} props.onClose - Callback function to close the alert.
 * @returns {JSX.Element} The alert modal.
 */
const CustomAlert = ({ message, onClose }) => (
  <div className={styles.overlay}>
    <div className={styles.modalAlert}>
      <h3>{message}</h3>
      <button className={styles.closeButtonAlert} onClick={onClose}>Close</button>
    </div>
  </div>
);


/**
 * XReport Component
 * 
 * This component allows users to generate an X-Report for hourly sales data.
 * It fetches the data from the server and displays it in both a chart and a table format.
 * The user selects a date to generate the report, and an alert is displayed if no date is chosen.
 * 
 * @component
 * @param {Object} props - The properties for the XReport component.
 * @param {function} props.onClose - Callback function to close the modal.
 * @returns {JSX.Element} The XReport modal.
 */
const XReport = ({ onClose }) => {
  const [date, setDate] = useState('');
  const [hourlySales, setHourlySales] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  /**
   * Fetches hourly sales data from the server based on the selected date.
   * 
   * @async
   * @param {string} dateInput - The selected date for which to fetch hourly sales data.
   * @returns {void}
   */
  const fetchHourlySales = async (dateInput) => {
    try {
      const formattedDate = new Date(dateInput).toISOString().split('T')[0];
      const response = await axios.get(`/api/xreport?date=${formattedDate}`);
      
      const data = response.data;
      setHourlySales(data.hourlySales);
    } catch (error) {
      console.error('Error fetching hourly sales:', error);
    }
  };

  /**
   * Generates the X-Report if a date is selected. 
   * If no date is selected, displays an alert message.
   * 
   * @returns {void}
   */
  const generateReport = () => {
    if (!date) {
      setAlertMessage('Please select a date.');
      setShowAlert(true);
      return;
    }
    fetchHourlySales(date);
  };

  /**
   * Closes the alert modal.
   * 
   * @returns {void}
   */
  const closeAlert = () => setShowAlert(false);

  // Prepare data for the chart
  const chartData = {
    labels: hourlySales.map(entry => entry.hour),
    datasets: [
      {
        label: 'Total Sales ($)',
        data: hourlySales.map(entry => entry.totalSales),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
  
        <h2>X-Report (Hourly Sales)</h2>
        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
  
        <button className={styles.generateReportButton} onClick={generateReport}>
          Generate Report
        </button>
  
        {hourlySales.length > 0 && (
          <div className={styles.reportContent}>
            {/* Render the chart */}
            <div className={styles.chartContainer}>
              <Line data={chartData} />
            </div>
            
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Hour</th>
                  <th>Total Sales ($)</th>
                </tr>
              </thead>
              <tbody>
                {hourlySales.map((entry) => (
                  <tr key={entry.hour}>
                    <td>{entry.hour}</td>
                    <td>${entry.totalSales.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          
        
  
        {/* Show the alert if needed */}
        {showAlert && <CustomAlert message={alertMessage} onClose={closeAlert} />}
      </div>
    </div>
  );
  
};

export default XReport;
