/**
 * Cashier View Component
 * 
 * @author Yuexin Zhang
 * @description Displaing user information, taking orders including a la carte as well as combo orders. 
 * This integrates order managements and cash out functionality within a single interface. 
 * 
 */

"use client";

import { useEffect, useState } from 'react';
import MenuGrid from './menu_grid';
import { useRouter } from 'next/navigation';
import styles from './pos.module.css';
import Footer from './footer'
import axios from 'axios';
import translateText from './translate';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

/**
 * Cashier View Component
 * 
 * @description Cashier interface for managing user information, order summaries, and operations 
 * such as adding menu items, managing combos, and processing orders. 
 * 
 * @returns {JSX.Element} Cashier View Component
 */
const POSView = () => {
  const router = useRouter();

  // state to manage user details 
  const [user, setUser] = useState({ employee_id: '', employee_name: '', job_title: '' });
  
  // state to manage order summary and total price 
  const [orderSummary, setOrderSummary] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // state for popup and combo handling
  const [isPopupEnabled, setIsPopupEnabled] = useState(true);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [selectedSide, setSelectedSide] = useState([]);
  const [selectedEntree, setSelectedEntree] = useState([]);


  /**
   * Fetch user data when the component mounts 
   */
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            setUser(JSON.parse(userData));
        } catch (error) {
            console.error('Failed to parse user data:', error);
        }
    }
  }, []);

  /**
   * Handlees user logout and redirecting to the login page. 
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/pages/login'); 
  };

  /**
   * Adds a selected item to the order summary. 
   * 
   * @param {Object} selectedItem - Selected item details 
   */
  const addToOrderSummary = (selectedItem) => {
    console.log("Selected item in POSView:", selectedItem);
    const newItem = {
      ...selectedItem,
      isChild: selectedCombo && !selectedItem.isParent,
    };
    console.log("New item to be added:", newItem);
  
    setOrderSummary((prevSummary) => {
      const updatedSummary = [
        ...prevSummary,
        { 
          menu_item_id: selectedItem.menu_item_id,
          menu_item_name: selectedItem.menu_item_name, 
          combo: selectedItem.combo || 'f',
          combo_type: selectedItem.combo_type || 'N/A',
          size: selectedItem.size || 'combo', 
          price: selectedItem.price,
          isChild: newItem.isChild,
          isParent: selectedItem.isParent || false,
        },
      ];
      console.log("Updated order summary:", updatedSummary);
      return updatedSummary;
    });
  };

  /**
   * Calculates the total price whenever the order summary changes.
   */
  useEffect(() => {
    const newTotal = orderSummary.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(newTotal);
  }, [orderSummary]);

  /**
   * Deletes the last added item from the order summary. 
   */
  const deleteLastItem = () => {
    setOrderSummary((prevSummary) => prevSummary.slice(0, -1));
  };

  /**
   * Handle when the "Cash Out" button is clicked by sending order details to the backend. 
   */
  const handleCashOut = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const employee_id = userData ? userData.employee_id : null; 
  
      // Prepare the order data
      const orderData = {
        employee_id: employee_id || null,
        order_price: totalPrice,
        order_status: 'Completed',
        order_items: orderSummary.map(item => ({
          menu_item_id: item.menu_item_id,
          combo: item.combo || 't',
          combo_type: item.combo_type || 'Bowl',
          item_size: item.size || 'N/A',
          recorded_quantity: item.recorded_quantity || 1,
        }))
      };
  
      // Send the data to the backend using axios
      const response = await axios.post('/api/add-order', orderData, {
        headers: { 'Content-Type': 'application/json' }
      });
  
      if (response.status === 200) {
        const result = response.data;
        console.log('Order added successfully:', result);
  
        // Reset the order summary or redirect to a confirmation page
        setOrderSummary([]);
        alert('Order has been successfully placed!');
      } else {
        console.error('Error placing order:', response.statusText);
        alert('There was an error processing your order.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error processing your order.');
    }
  };  

  /**
   * Cancels tthe current order, resetting all states. 
   */
  const handleCancel = () => {
    setOrderSummary([]); 
    setIsPopupEnabled(true);
    resetCombo();
    // alert("Order has been canceled, but the summary is preserved.");
  };

  /**
   * Handles selection of a combo type.
   * 
   * @param {string} comboType - Type of combo selected 
   */
  const handleComboClick = (comboType) => {
    console.log(`Combo button clicked: ${comboType}`);
    const parentItem = {
      menu_item_name: comboType.replace('_', ' ').toUpperCase(), 
      combo: 't',
      combo_type: comboType,
      isParent: true,
      price: null,
    };
  
    addToOrderSummary(parentItem);
    console.log("Parent Item Added:", parentItem);

    setSelectedCombo(comboType);
    setIsPopupEnabled(false);
  };

  /**
   * Reset combo states. 
   */
  const resetCombo = () => {
    setSelectedCombo(null);
    setSelectedSide([]);
    setSelectedEntree([]);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.employeeInfo}>
          <p>Employee: {user.name}</p> {/* Display user name */}
          <p>Role: {user.jobTitle}</p> {/* Display user role */}
        </div>
        <div className={styles.reports}>
          <button onClick={() => handleComboClick("bowl")} className={styles.cashOutButton}>Bowl</button>
          <button onClick={() => handleComboClick("plate")} className={styles.cashOutButton}>Plate</button>
          <button onClick={() => handleComboClick("bigger_plate")} className={styles.cashOutButton}>Bigger Plate</button>
          <button onClick={handleLogout} className={styles.reportButton}>Log Out</button>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.MenuGrid}>
          <MenuGrid 
            selectedEntree={selectedEntree} 
            setSelectedEntree={setSelectedEntree} 
            selectedSide={selectedSide} 
            setSelectedSide={setSelectedSide} 
            selectedCombo={selectedCombo} 
            setSelectedCombo={setSelectedCombo} 
            addToOrderSummary={addToOrderSummary} 
            isPopupEnabled={isPopupEnabled}
            resetCombo={resetCombo}
          />  
        </div>
        <div className={styles.orderSummary}>
          <h3>Order Summary</h3>
          <ul>
            {orderSummary.map((item, index) => (
              // <li key={index}>
              //   {item.menu_item_name} - {item.size || 'No size selected'}
              // </li>
              <li
                key={index}
                style={{
                  paddingLeft: item.isChild ? '20px' : '0px', // Indent child items
                  fontWeight: item.isParent ? 'bold' : 'normal', // Bold parent items
                }}
              >
                {item.menu_item_name}
                {item.price !== null ? ` - $${item.price.toFixed(2)}` : ''}
              </li>
            ))}
          </ul>
          <p>Total: ${totalPrice.toFixed(2)}</p>
        </div>
        <div className={styles.cashOutButtons}>
          <button onClick={handleCashOut} className={styles.cashOutButton}>Cash Out</button>
          <button onClick={deleteLastItem} className={styles.cashOutButton}>Delete Last Item</button>
          <button onClick={handleCancel} className={styles.cashOutButton}>Cancel</button>
        </div>
      </main>
      <Footer 
        handleComboClick={handleComboClick}
        handleLanguageChange={handleLanguageChange}
      />
    </div>
  );
};

export default POSView;