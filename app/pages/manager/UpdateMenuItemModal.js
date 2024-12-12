/**
 * @file UpdateMenuItemModal.js
 * @description This component allows the admin to update the calorie information of a specific menu item.
 * It provides input fields for the Menu Item ID and the new calorie value. Upon confirmation, 
 * the data is sent to the server, and if successful, the modal is closed.
 * 
 * @author Jane Landrum
 */
import React, { useState } from 'react';
import axios from 'axios';
import styles from './UpdateMenuItemModal.module.css';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

/**
 * UpdateMenuItemModal component.
 * This modal allows updating the calorie value of a menu item by providing its ID and new calorie information.
 * 
 * @component
 * @example
 * // Usage
 * <UpdateMenuItemModal onClose={handleClose} />
 * 
 * @param {Function} onClose - Callback function to close the modal.
 * 
 * @returns {JSX.Element} The modal for updating the menu item's calorie information.
 */
const UpdateMenuItemModal = ({ onClose }) => {
  const [menuItemId, setMenuItemId] = useState('');
  const [calories, setCalories] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Handles the confirm button click event. 
   * It checks if the required fields (Menu Item ID and Calories) are filled out,
   * and if so, sends a POST request to the server to update the calorie information.
   * 
   * @async
   * @function handleConfirmClick
   * @returns {void}
   */
  const handleConfirmClick = async () => {
    if (!menuItemId || !calories) {
      setErrorMessage('Both fields are required');
      return;
    }

    try {
      // Send the POST request to update calories
      const response = await axios.post('/api/set-calories', {
        id: menuItemId,
        calories: parseInt(calories), // Convert calories to integer
      });

      // If the update is successful, close the modal
      if (response.status === 201) {
        onClose();
      }
    } catch (error) {
      setErrorMessage('Error updating calories');
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Update Menu Item Calories</h2>
        <div className={styles.inputGroup}>
          <label>Menu Item ID:</label>
          <input
            type="text"
            value={menuItemId}
            onChange={(e) => setMenuItemId(e.target.value)}
            placeholder="Enter menu item ID"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>New Calories:</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Enter new calorie value"
          />
        </div>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <div className={styles.buttonGroup}>
          <button onClick={handleConfirmClick}>Confirm</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default UpdateMenuItemModal;
