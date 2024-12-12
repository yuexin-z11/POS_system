import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddMenuItemModal from './AddMenuItemModal';
import RemoveMenuItemModal from './RemoveMenuItemModal';
import UpdateMenuItemModal from './UpdateMenuItemModal';
import styles from './MenuModal.module.css';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

const MenuModal = ({ onClose }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showUpdateMenuItemModal, setUpdateMenuItemModal] = useState(false);

  useEffect(() => {
    // Fetch all menu items on component mount
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('/api/menu');
        const sortedItems = response.data.sort((a, b) => a.menu_item_id - b.menu_item_id); // Sort by menu_item_id
        setMenuItems(sortedItems);  // Set the sorted items
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };
  
    fetchMenuItems();
  }, []);

  const handleAddMenuItemClick = () => {
    setShowAddModal(true);
  };

  const handleRemoveMenuItemClick = () => {
    setShowRemoveModal(true);
  };

  const handleUpdateMenuItemClick = () => {
    setUpdateMenuItemModal(true);
  };

  const handleCloseClick = () => {
    onClose();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Menu Items</h2>
        <table className={styles.menuTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Calories</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.menu_item_id}>
                <td>{item.menu_item_id}</td>
                <td>{item.menu_item_name}</td>
                <td>{item.menu_item_type}</td>
                <td>{item.menu_item_calories}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.buttonGroup}>
          <button onClick={handleAddMenuItemClick}>Add Menu Item</button>
          <button onClick={handleUpdateMenuItemClick}>Update Menu Item</button>
          <button onClick={handleRemoveMenuItemClick}>Delete Menu Item</button>
          <button onClick={handleCloseClick}>Close</button>
        </div>
      </div>

      {/* Show modals based on state */}
      {showAddModal && <AddMenuItemModal onClose={() => setShowAddModal(false)} />}
      {showRemoveModal && <RemoveMenuItemModal onClose={() => setShowRemoveModal(false)} />}
      {showUpdateMenuItemModal && <UpdateMenuItemModal onClose={() => setUpdateMenuItemModal(false)} />}
    </div>
  );
};

export default MenuModal;
