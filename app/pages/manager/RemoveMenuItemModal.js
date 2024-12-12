/**
 * RemoveMenuItemModal Component
 * 
 * This component allows the user to remove a menu item from the system. It provides
 * an input field for the user to enter the name of the menu item they wish to remove.
 * If the removal is successful, the modal closes. If an error occurs, an error message is displayed.
 * 
 * @author Jane Landrum
 * Date: December 2024
 * 
 * @component
 */
"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './RemoveMenuItemModal.module.css';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

/**
 * RemoveMenuItemModal Component
 * 
 * This component provides a modal for removing a menu item from the system.
 * It allows the user to input the name of the menu item to be removed and 
 * submits the removal request to the server. If successful, the modal is closed.
 * If there is an error (e.g., the item doesn't exist or the input is empty), 
 * an error message is displayed.
 * 
 * @component
 * @param {Object} props - The properties for the RemoveMenuItemModal component.
 * @param {function} props.onClose - Callback function to close the modal.
 * @returns {JSX.Element} The modal for removing a menu item.
 */
const RemoveMenuItemModal = ({ onClose }) => {
  const [menuItemName, setMenuItemName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Handles the change event for the input field.
   * 
   * @param {Object} e - The event object.
   * @returns {void}
   */
  const handleInputChange = (e) => {
    setMenuItemName(e.target.value);
  };

  /**
   * Handles the remove item action. It sends a request to the server to remove the item.
   * If the item name is not entered, an error message is shown.
   * 
   * @async
   * @returns {void}
   */
  const handleRemoveItem = async () => {
    if (!menuItemName) {
        setErrorMessage('Please enter the name of the menu item to remove');
        return;
    }

    try {
      const response = await axios.post('/api/remove-menu-item', {
          name: menuItemName
      }, {
          headers: { 'Content-Type': 'application/json' },
      });
  
      console.log(response.data.message); // Log the message on success
      onClose(); // Close the modal on success
    } catch (error) {
        console.error('Error removing item:', error);
        setErrorMessage('Failed to remove menu item');
    }
};


  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Remove Menu Item</h2>
        <input
          type="text"
          placeholder="Enter menu item name"
          value={menuItemName}
          onChange={handleInputChange}
          className={styles.inputField} // Use className for input
        />
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <div className={styles.modalActions}>
          <button onClick={handleRemoveItem} className={styles.button}>Remove Item</button> {/* Use className for button */}
          <button onClick={onClose} className={styles.button}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default RemoveMenuItemModal;
