"use client";

import { useEffect, useState } from 'react';
import AddMenuItemModal from './AddMenuItemModal';
import RemoveMenuItemModal from './RemoveMenuItemModal'; // Import the new RemoveMenuItemModal component
import MenuGrid from './menu_grid';
import { useRouter } from 'next/navigation';
import styles from './pos.module.css';

const POSView = () => {
  const [user, setUser] = useState({ employee_name: '', job_title: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false); // State for RemoveMenuItemModal

  useEffect(() => {
    // Retrieve user data from local storage when component mounts
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData)); // Parse and set user data
    }
  }, []);

  // Button functionality for add menu item modal
  const handleAddItemClick = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  // Button functionality for remove menu item modal
  const handleRemoveItemClick = () => setShowRemoveModal(true); // Open remove modal
  const handleCloseRemoveModal = () => setShowRemoveModal(false); // Close remove modal

  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data from local storage
    router.push('/pages/login'); // Redirect to the login page
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.employeeInfo}>
          <h2>Employee: {user.employee_name}</h2> {/* Display user name */}
          <p>Role: {user.job_title}</p> {/* Display user role */}
        </div>
        <div className={styles.reports}>
          <button onClick={handleAddItemClick} className={styles.reportButton}>Add Menu Item</button>
          <button onClick={handleRemoveItemClick} className={styles.reportButton}>Remove Menu Item</button> {/* Open remove modal */}
          <button className={styles.reportButton}>Employee Information</button>
          <button className={styles.reportButton}>X Report</button>
          <button className={styles.reportButton}>Z Report</button>
          <button className={styles.reportButton}>Log Out</button>
        </div>
      </header>
      <main className={styles.main}>
        <MenuGrid />
        <div className={styles.orderSummary}>
          <h3>Order Summary</h3>
          <p>Items: 5</p>
          <p>Total: $100.00</p>
        </div>
        <div className={styles.cashOutButtons}>
          <button className={styles.cashOutButton}>Cash Out</button>
          <button className={styles.cashOutButton}>Cancel</button>
        </div>
        {showAddModal && <AddMenuItemModal onClose={handleCloseAddModal} />}
        {showRemoveModal && <RemoveMenuItemModal onClose={handleCloseRemoveModal} />} {/* Show remove modal */}
      </main>
    </div>
  );
};

export default POSView;
