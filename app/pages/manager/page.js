"use client";

import Head from 'next/head';
import { useEffect, useState } from 'react';
import MenuModal from './MenuModal';
import EmployeeInfoModal from './EmployeeInfoModal';
import ZReport from './ZReport';
import XReport from './XReport';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import MenuGrid from './menu_grid';
import { useRouter } from 'next/navigation';
import styles from './pos.module.css';
import Footer from './footer';
import axios from 'axios';

// axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
axios.defaults.baseURL = 'http://localhost:5000';

const POSView = () => {
  const router = useRouter();
  const [user, setUser] = useState({ employee_name: '', job_title: '' });
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [showZReport, setShowZReport] = useState(false);
  const [showXReport, setShowXReport] = useState(false);
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [showInventoryReport, setShowInventoryReport] = useState(false);
  const [orderSummary, setOrderSummary] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [selectedSide, setSelectedSide] = useState([]);
  const [selectedEntree, setSelectedEntree] = useState([]);
  const [isPopupEnabled, setIsPopupEnabled] = useState(true);
  const [showMenuModal, setShowMenuModal] = useState(false);

  useEffect(() => {
    // Retrieve user data from local storage when component mounts
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Button functionality for add menu item modal
  const handleMenuModalClick = () => setShowMenuModal(true);
  const handleCloseMenuModal = () => setShowMenuModal(false);

  // Button functionality for employee information modal
  const handleEmployeeInfoClick = () => setIsEmployeeModalOpen(true);
  const closeEmployeeInfoModal = () => setIsEmployeeModalOpen(false);

  // Button functionality for Z Report modal
  const handleZReportClick = () => setShowZReport(true);
  const handleCloseZReport = () => setShowZReport(false);

  // Button functionality for X Report modal 
  const handleXReportClick = () => setShowXReport(true); 
  const handleCloseXReport = () => setShowXReport(false);

  //Button functionality for Sales Report modal
  const handleSalesReportClick = () => setShowSalesReport(true);
  const handleCloseSalesReport = () => setShowSalesReport(false);

  //Button functionality for Inventory Report modal
  const handleInventoryReportClick = () => setShowInventoryReport(true);
  const handleCloseInventoryReport = () => setShowInventoryReport(false);


  // Function for logging out, it will direct back to the login page
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/pages/login');
  };

  // Function to handle adding the item to the order summary 
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

  // Update the total price whenever orderSummary changes
  useEffect(() => {
    const newTotal = orderSummary.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(newTotal);
  }, [orderSummary]);

  // Function to delete the last item added to the order summary
  const deleteLastItem = () => {
    setOrderSummary((prevSummary) => prevSummary.slice(0, -1));
  };

  const handleCashOut = async () => {
    try {
      // Assuming the user is an employee and has employee_id in localStorage
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

        // Handle success (e.g., reset order summary, show success message, etc.)
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
  const handleCancel = () => {
    setOrderSummary([]); 
    setIsPopupEnabled(true);
    resetCombo();
  };

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

  const resetCombo = () => {
    setSelectedCombo(null);
    setSelectedSide([]);
    setSelectedEntree([]);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>POS System</title>
        <link rel="icon" href="https://cdn.cookielaw.org/logos/fbcad385-5bbd-48ba-97d4-e5bcabcd10b9/67c1852a-0424-4c45-ae27-c587b2b01745/573a432a-97c1-4b6f-b44e-1911f400a20f/1200px-Panda_Express_logo.svg.png" /> {/* Link to the favicon file in the public folder */}
      </Head>
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
          <li
          key={index}
          style={{
            paddingLeft: item.isChild ? '20px' : '0px',
            fontWeight: item.isParent ? 'bold' : 'normal',
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
    {showMenuModal && <MenuModal onClose={handleCloseMenuModal} />}
    {isEmployeeModalOpen && <EmployeeInfoModal onClose={closeEmployeeInfoModal} />}
    {showZReport && <ZReport onClose={handleCloseZReport} />}
    {showXReport && <XReport onClose={handleCloseXReport} />}
    {showSalesReport && <SalesReport onClose={handleCloseSalesReport} />}
    {showInventoryReport && <InventoryReport onClose={handleCloseInventoryReport} />}
  </main>

      <Footer 
        handleComboClick={handleComboClick}
        handleMenuModalClick={handleMenuModalClick}
        handleEmployeeInfoClick={handleEmployeeInfoClick}
        handleXReportClick={handleXReportClick}
        handleZReportClick={handleZReportClick}
        handleSalesReportClick={handleSalesReportClick}
        handleInventoryReportClick={handleInventoryReportClick}
      />
    </div>
  );
};

export default POSView;