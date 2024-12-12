import React, { useState } from 'react';
import styles from './AddMenuItemModal.module.css';

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
  const [status, setStatus] = useState('');

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

    try {
        // Step 1: Fetch the current highest menu_item_id from the server
        const highestIdResponse = await fetch('http://localhost:5000/api/highest-menu-item-id');
        if (!highestIdResponse.ok) {
            throw new Error('Failed to fetch the highest menu item ID');
        }
        const { max_id } = await highestIdResponse.json();

        // Step 2: Increment the highest ID to get the new menu item ID
        const new_id = max_id + 1;
        
        // Step 3: Send the new menu item with the new ID to the server
        const response = await fetch('http://localhost:5000/api/add-menu-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...new_item, menu_item_id: new_id }),
        });

        if (!response.ok) {
            throw new Error('Failed to add menu item');
        }

        const result = await response.json();
        console.log(result.message);
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
