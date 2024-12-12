"use client";

import { useState } from 'react';
import styles from './RemoveMenuItemModal.module.css';

const RemoveMenuItemModal = ({ onClose }) => {
  const [menuItemName, setMenuItemName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    setMenuItemName(e.target.value);
  };

  const handleRemoveItem = async () => {
    if (!menuItemName) {
        setErrorMessage('Please enter the name of the menu item to remove');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/remove-menu-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: menuItemName })
        });

        if (!response.ok) {
            const errorText = await response.text(); // Read the response as text if not OK
            console.error('Error response:', errorText);
            setErrorMessage('Failed to remove menu item');
            return;
        }

        const result = await response.json();
        alert(result.message);
        onClose(); // Close the modal on success
    } catch (error) {
        setErrorMessage('Error removing item');
        console.error('Fetch error:', error);
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
