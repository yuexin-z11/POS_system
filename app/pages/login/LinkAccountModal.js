/**
 * LinkAccountModal Component
 * 
 * This component renders a modal that allows the user to link their Google account 
 * to an existing employee profile. The modal displays a list of employees and enables 
 * the user to select one to associate with their Google account. After linking, 
 * the modal closes and the user is redirected to the login page.
 * 
 * @author Jane Landrum
 * Date: December 2024
 * 
 * @component
 */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./LinkAccountModal.module.css";

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = "http://localhost:5000";


/**
 * LinkAccountModal Component
 * 
 * Renders a modal that allows users to link their Google account to an employee profile.
 * Displays a list of unlinked employees for selection and triggers the linking process.
 * 
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.googleId - The Google account ID to be linked.
 * @param {function} props.onClose - Function to close the modal when invoked.
 * @param {function} props.onLink - Function to be called once the account has been linked successfully.
 */
const LinkAccountModal = ({ googleId, onClose, onLink }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");

  /**
   * Fetches the list of unlinked employees from the backend API.
   * Sets the employees data in the state or displays an error if fetching fails.
   * 
   * @async
   * @returns {void}
   */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/api/unlinked-employees");
        setEmployees(response.data); // Set the employees data from the response
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("Failed to fetch employees.");
      }
    };
    fetchEmployees();
  }, [googleId]);

  /**
   * Handles the process of linking the selected Google account to the selected employee.
   * Sends the request to the backend and triggers the provided `onLink` callback if successful.
   * 
   * @async
   * @returns {void}
   */
  const handleLinkAccount = async () => {
    alert("Google account linked to user! Please log in again.");

    if (selectedEmployeeId && googleId) {
      try {
          const response = await axios.post('/api/link-google', { googleId, employeeId: selectedEmployeeId });
          if (response.status === 200) {
              onLink(); // Close modal and redirect back to login page
          } else {
              setError('Failed to link account.');
          }
      } catch (err) {
          console.error('Error linking account:', err);
          setError('Failed to link account.');
      }
    }
  };

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles.modal}>
        <h2>Link Your Account</h2>
        <p>Select your account to link to this Google profile:</p>
        {error && <p className={styles.error}>{error}</p>}
        <ul>
          {employees.map((employee) => (
            <li key={employee.employee_id}>
              <button
                className={selectedEmployeeId === employee.employee_id ? styles.active : ""}
                onClick={() => {
                    setSelectedEmployeeId(employee.employee_id)
                }}
              >
                {employee.employee_name}
              </button>
            </li>
          ))}
        </ul>
        <button
            onClick={() => {
                handleLinkAccount();
            }}
            disabled={!selectedEmployeeId}
            className={styles.button}
        >
            Link Account
        </button>
        <button className="close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default LinkAccountModal;
