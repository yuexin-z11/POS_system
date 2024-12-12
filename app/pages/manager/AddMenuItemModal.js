/**
 * @description Modal component for adding a new menu item with options for name, type, description, and pricing details.
 * Handles validation and submits new menu items to the backend.
 * @use client
 * @module AddMenuItemModal
 * @requires React
 * @requires axios
 * @requires './AddMenuItemModal.module.css'
 * @requires useState
 * @requires useEffect
 * @version 1.0.0
 * @date 2024
 * @author Jane Landrum
 */
"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './AddMenuItemModal.module.css';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

/**
 * Modal Component to add a new menu item.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @returns {JSX.Element} React component for adding menu items.
 */
const AddMenuItemModal = ({ onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [spice, setSpice] = useState('');
  const [woksmart, setWoksmart] = useState('');
  const [calories, setCalories] = useState('');
  const [priceSmall, setPriceSmall] = useState('');
  const [priceMedium, setPriceMedium] = useState('');
  const [priceLarge, setPriceLarge] = useState('');

  /**
   * Handles confirming the addition of a new menu item.
   * Validates input fields and sends the new menu item data to the backend.
   * 
   * @async
   * @function handleConfirm
   */
  const handleConfirm = async () => {
    const new_item = {
        name,
        type,
        description,
        spice: spice === 'yes',
        woksmart: woksmart === 'yes',
        calories: parseInt(calories),
        priceSmall: parseFloat(priceSmall),
        priceMedium: parseFloat(priceMedium),
        priceLarge: parseFloat(priceLarge),
        status: true
    };

    // Gets the highest menu item id in the table, increments it, and then adds the new item to the menu_items table with the incremented id
    try {
      const highestIdResponse = await axios.get('/api/highest-menu-item-id');
      const { max_id } = highestIdResponse.data;

      const new_id = max_id + 1;
      
      const response = await axios.post('/api/add-menu-item', {
          ...new_item,
          menu_item_id: new_id,
      }, {
          headers: { 'Content-Type': 'application/json' },
      });
  
      console.log(response.data.message);
      onClose();
    } catch (error) {
        console.error('Error:', error);
    }
  };

  

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Add New Menu Item</h2>

        <label className={styles.label}>Item Name</label>
        <input type="text" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />

        <label className={styles.label}>Item Type</label>
        <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Select type</option>
          <option value="entree">Entree</option>
          <option value="side">Side</option>
          <option value="appetizer">Appetizer</option>
          <option value="dessert">Dessert</option>
          <option value="drink">Drink</option>
        </select>

        <label className={styles.label}>Item Description</label>
        <input type="text" className={styles.input} value={description} onChange={(e) => setDescription(e.target.value)} />

        <label className={styles.label}>Spicy?</label>
        <select className={styles.select} value={spice} onChange={(e) => setSpice(e.target.value)}>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        <label className={styles.label}>Woksmart?</label>
        <select className={styles.select} value={woksmart} onChange={(e) => setWoksmart(e.target.value)}>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        <label className={styles.label}>Calories</label>
        <input type="number" className={styles.input} value={calories} onChange={(e) => setCalories(e.target.value)} />

        <label className={styles.label}>Small Price</label>
        <div className={styles.priceInput}>
          <span>$</span>
          <input type="number" step="0.01" className={styles.input} value={priceSmall} onChange={(e) => setPriceSmall(e.target.value)} />
        </div>

        <label className={styles.label}>Medium Price</label>
        <div className={styles.priceInput}>
          <span>$</span>
          <input type="number" step="0.01" className={styles.input} value={priceMedium} onChange={(e) => setPriceMedium(e.target.value)} />
        </div>

        <label className={styles.label}>Large Price</label>
        <div className={styles.priceInput}>
          <span>$</span>
          <input type="number" step="0.01" className={styles.input} value={priceLarge} onChange={(e) => setPriceLarge(e.target.value)} />
        </div>

        <button className={styles.confirmButton} onClick={handleConfirm}>Confirm</button>
        <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default AddMenuItemModal;
