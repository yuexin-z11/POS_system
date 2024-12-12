/**
 * Express Application for managing menu items and employee data.
 * 
 * This application provides a REST API for handling menu items, prices,
 * employee data, and authentication. It interacts with a PostgreSQL database
 * via helper functions in the database module.
 * 
 * @version 1.0
 * @since 2024-12-04
 * 
 * @author Emily Abraham
 * @author Alexis Santiago
 * @author Jane Landrum
 * @author Sonika Madhu
 * @author Yuexin Zhang
 */

const express = require('express');
const cors = require('cors');
const db = require('./app/database/db');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

/**
 * Get a menu item by ID.
 * @route GET /api/menu/:id
 * @param {string} id - The ID of the menu item to retrieve.
 * @returns {Object} 200 - The menu item object.
 * @returns {Object} 404 - Item not found message.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/menu/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const item = await db.getMenuItemById(id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Get all menu items or items of a specified type.
 * @route GET /api/menu
 * @queryParam {string} [type] - The type of menu items to retrieve.
 * @returns {Object[]} 200 - Array of menu items.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/menu', async (req, res) => {
    const { type: item_type } = req.query;
    try {
        let items;
        if (item_type) {
            items = await db.getMenuItemsOfType(item_type);
            if (items.length === 0) {
                console.log(`No items found for type: ${item_type}`);
            }
        } else {
            items = await db.getMenuItemNames();
        }
        res.json(items);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Get all spicy menu items.
 * @route GET /api/spice
 * @returns {Object[]} 200 - Array of spicy menu items.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/spice', async (req, res) => {
    try {
        const items = await db.getMenuItemOfSpice();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Get all wok smart menu items.
 * @route GET /api/wok
 * @returns {Object[]} 200 - Array of wok smart menu items.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/wok', async (req, res) => {
    try {
        const items = await db.getMenuItemOfWokSmart();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Get all premium menu items.
 * @route GET /api/premium
 * @returns {Object[]} 200 - Array of premium menu items.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/premium', async (req, res) => {
    try {
        const items = await db.getMenuItemOfPremium();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Get information about a menu item or all items.
 * @route GET /api/info/:item?
 * @param {string} [item] - The name of the menu item.
 * @returns {Object[]} 200 - Array of menu item information.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/info/:item?', async (req, res) => {
    const { item } = req.params;
    try {
        let items;
        if (item) {
            items = await db.getMenuItemInfo(item);
            if (items.length === 0) {
                console.log(`No allergens found for item: ${item}`);
            }
        } else {
            items = await db.getMenuItemInfo();
        }
        res.json(items);
    } catch (error) {
        console.error('Error fetching menu item information:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to get menu items availablity due to ingredient quantity
app.get('/api/availability/:item?', async (req, res) => {
    // Access item from the query parameter
    const { item } = req.params;

    try {
        let items;
            if (item) {
                items = await db.getMenuItemAvailability(item);
                if (items.length === 0) {
                    console.log(`No availability found for item: ${item}`);
                }
            }
            //items = await db.getMenuItemAvailability(item);
        res.json(items);
    } catch (error) {
        console.error('Error fetching menu item availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint for getting prices
app.get('/get-price/:item/:size', async (req, res) => {
    const { item, size } = req.params; // Destructure the item and size from params

    try {
        const price = await db.getPriceFromDatabase(item, size); // Call the price fetching function
        if (price === "Price not found" || price === "Invalid size") {
            res.status(404).json({ error: price });
        } else {
            res.json({ item, size, price }); // Send the price as a JSON response
        }
    } catch (error) {
        console.error('Error fetching price:', error); // Log the error
        res.status(500).json({ error: 'Failed to fetch price' }); // Send error response
    }
});

/**
 * Log in a user based on their email and employee ID.
 * @route POST /api/login
 * @bodyParam {string} email - The user's email address.
 * @bodyParam {number} employee_id - The user's employee ID.
 * @returns {Object} 200 - User object with structured user information.
 * @returns {Object} 401 - Invalid credentials message.
 * @returns {Object} 500 - Server error message.
 */
app.post('/api/login', async (req, res) => {
    const { email, employee_id } = req.body; // Ensure this matches the names in your fetch request

    try {
        console.log(`Attempting to log in with email: ${email} and employee_id: ${employee_id}`);
        const user = await db.authenticateUser(email, parseInt(employee_id));
        console.log(user); // Log the user returned by the database

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return structured user information
        res.json({ user: { employee_id:user.employee_id, employee_name: user.employee_name, job_title: user.job_title } }); // Modify this line
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


/**
 * Retrieve the highest menu item ID.
 * @route GET /api/highest-menu-item-id
 * @returns {Object} 200 - Object containing the maximum menu item ID.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/highest-menu-item-id', async (req, res) => {
    try {
        const max_id = await db.getHighestMenuItemId(); // Should call the correct function
        res.json({ max_id });
    } catch (error) {
        console.error('Failed to retrieve highest menu item id:', error);
        res.status(500).json({ message: 'Failed to retrieve highest menu item id' });
    }
});

/**
 * Add a new menu item to the database.
 * @route POST /api/add-menu-item
 * @bodyParam {Object} item - The menu item data to be added.
 * @returns {Object} 201 - Success message and the new menu item ID.
 * @returns {Object} 500 - Server error message.
 */
app.post('/api/add-menu-item', async (req, res) => {
    const item = req.body;
    try {
        const newItemId = await db.addMenuItem(item);
        res.status(201).json({ message: 'Menu item added successfully', menu_item_id: newItemId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add menu item' });
    }
});

/**
 * Remove a menu item (set its status to inactive).
 * @route POST /api/remove-menu-item
 * @bodyParam {string} name - The name of the menu item to remove.
 * @returns {Object} 200 - Success message.
 * @returns {Object} 404 - Item not found message.
 * @returns {Object} 500 - Server error message.
 */
app.post('/api/remove-menu-item', async (req, res) => {
    const { name } = req.body;
    try {
        const wasRemoved = await db.removeMenuItem(name); // Call the function from db.js
        if (wasRemoved) {
            res.json({ message: 'Menu item removed successfully' });
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        console.error('Failed to remove menu item:', error);
        res.status(500).json({ message: 'Failed to remove menu item' });
    }
});

/**
 * Get all employee information.
 * @route GET /api/employees
 * @returns {Object[]} 200 - Array of employee information.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/employees', async (req, res) => {
    console.log("Request received for /api/employees");
    try {
        const employees = await db.getEmployeeInfo();
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employee information:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Get all employees whose accounts are not linked through Google.
 * @route GET /api/unlinked-employees
 * @returns {Object[]} 200 - Array of unlinked employee information.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/unlinked-employees', async (req, res) => {
    console.log("Request received for /api/unlinked-employees");
    try {
        const employees = await db.getEmployeesNotLinked();
        res.json(employees);
    } catch (error) {
        console.error('Error fetching unlinked employee information:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Retrieve the highest employee ID.
 * @route GET /api/highest-employee-id
 * @returns {Object} 200 - Object containing the maximum employee ID.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/highest-employee-id', async (req, res) => {
    try {
        const max_id = await db.getHighestEmployeeId();
        res.json({ max_id });
    } catch (error) {
        console.error('Failed to retrieve highest employee id:', error);
        res.status(500).json({ message: 'Failed to retrieve highest employee id' });
    }
});

/**
 * Add a new employee to the database.
 * @route POST /api/add-employee
 * @bodyParam {Object} employee - The employee data to be added.
 * @returns {Object} 201 - Success message and the new employee ID.
 * @returns {Object} 500 - Server error message.
 */
app.post('/api/add-employee', async (req, res) => {
    const employee = req.body;
    try {
        const newEmployeeId = await db.addEmployee(employee);
        res.status(201).json({ message: 'Employee added successfully', employee_id: newEmployeeId });
    } catch (error) {
        console.error('Failed to add employee:', error);
        res.status(500).json({ message: 'Failed to add employee' });
    }
});

/**
 * Remove an employee from the database.
 * @route DELETE /api/remove-employee/:id
 * @param {string} id - The ID of the employee to remove.
 * @returns {Object} 200 - Success message.
 * @returns {Object} 404 - Employee not found message.
 * @returns {Object} 500 - Server error message.
 */
app.delete('/api/remove-employee/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const isRemoved = await db.removeEmployee(id);
      if (isRemoved) {
        res.status(200).json({ message: 'Employee removed successfully.' });
      } else {
        res.status(404).json({ message: 'Employee not found.' });
      }
    } catch (error) {
      console.error('Error removing employee:', error.message);
      res.status(500).json({ message: 'Error removing employee.' });
    }
});

/**
 * Retrieve the Z-Report for a specific date.
 * @route GET /api/zreport
 * @queryParam {string} date - The date for the report (required).
 * @returns {Object} 200 - Object containing orders and total sales for the day.
 * @returns {Object} 400 - Error message if the date is not provided.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/zreport', async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: 'Date is required' });
    }

    console.log('Date received:', date);

    try {
        const { orders, total } = await db.getDailyOrders(date);
        res.json({ orders, total });
    } catch (error) {

        console.error('Failed to retrieve Z-Report data:', error.message);
        res.status(500).json({ message: 'Failed to retrieve Z-Report data' });
    }
});

/**
 * Retrieve the X-Report for a specific date.
 * @route GET /api/xreport
 * @queryParam {string} date - The date for the report (required).
 * @returns {Object} 200 - Object containing hourly sales data.
 * @returns {Object} 400 - Error message if the date is not provided.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/xreport', async (req, res) => {
    const { date } = req.query;
  
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
  
    try {
      const hourlySales = await db.getHourlySales(date);
      res.json({ hourlySales });
    } catch (error) {
      console.error('Failed to retrieve X-Report data:', error.message);
      res.status(500).json({ message: 'Failed to retrieve X-Report data' });
    }
});

/**
 * Retrieve the sales report for a specific date range.
 * @route GET /api/salesreport
 * @queryParam {string} startDate - The start date for the report (required).
 * @queryParam {string} endDate - The end date for the report (required).
 * @returns {Object} 200 - Object containing menu items with sales data.
 * @returns {Object} 400 - Error message if startDate or endDate is not provided.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/salesreport', async (req, res) => {
    const { startDate, endDate } = req.query;
  
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and End dates are required.' });
    }
  
    try {
      const menuItems = await db.getSalesReport(startDate, endDate);
      res.json({ menuItems });
    } catch (error) {
      console.error('Error fetching sales report:', error.message);
      res.status(500).json({ message: 'Failed to fetch sales report data.' });
    }
});

/**
 * Fetch the product usage report for a specific date range.
 * @route GET /api/inventory/product-usage
 * @queryParam {string} startDate - The start date for the report (optional).
 * @queryParam {string} endDate - The end date for the report (optional).
 * @returns {Object} 200 - Object containing product usage data.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/inventory/product-usage', async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
      const productUsage = await db.getProductUsage(startDate, endDate);
      res.json({ productUsage });
    } catch (error) {
      console.error('Error fetching product usage report:', error.message);
      res.status(500).json({ message: 'Failed to fetch product usage data.' });
    }
});

/**
 * Fetch the restock report for inventory.
 * @route GET /api/inventory/restock-report
 * @returns {Object} 200 - Object containing restock report data.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/inventory/restock-report', async (req, res) => {
    try {
      const restockReport = await db.getRestockReport();
      res.json({ restockReport });
    } catch (error) {
      console.error('Error fetching restock report:', error.message);
      res.status(500).json({ message: 'Failed to fetch restock report data.' });
    }
});

/**
 * Restock inventory items.
 * @route POST /api/inventory/restock
 * @returns {Object} 200 - Message indicating the number of items restocked.
 * @returns {Object} 500 - Server error message.
 */
app.post('/api/inventory/restock', async (req, res) => {
    try {
      const updatedRows = await db.restockInventory();
      res.json({ message: `${updatedRows} items restocked.` });
    } catch (error) {
      console.error('Error restocking inventory:', error.message);
      res.status(500).json({ message: 'Failed to restock inventory.' });
    }
});

/**
 * Retrieve the weekly promotional offers.
 * @route GET /api/promos
 * @returns {Object[]} 200 - Array of promotional offers.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/promos', async (req, res) => {
    try {
        let promos;
        promos = await db.getWeeklyPromos();
        res.json(promos);
    } catch (error) {
        console.error('Error fetching promos:', error.message);
        res.status(500).send('Server Error');
    }
});

/**
 * Add a new order to the system.
 * @route POST /api/add-order
 * @bodyParam {number} employee_id - The ID of the employee placing the order.
 * @bodyParam {number} order_price - The total price of the order.
 * @bodyParam {string} order_status - The status of the order.
 * @bodyParam {Array<Object>} order_items - The items included in the order.
 * @returns {Object} 200 - Message with the generated order ID.
 * @returns {Object} 500 - Error message if the order creation fails.
 */
app.post('/api/add-order', async (req, res) => {
    const { employee_id, order_price, order_status, order_items } = req.body;
    try {
        // Add the order (create empty row and update with price/status)
        const orderId = await db.addOrder(employee_id, order_price, order_status);

        // Add the order items using the generated orderId
        await db.addOrderItems(orderId, order_items);

        //Update inventory based on items in the order
        await db.updateInventory(orderId);

        res.status(200).json({ message: 'Order placed successfully', order_id: orderId });
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ message: 'Failed to add order', error: error.message });
    }
});

/**
 * Retrieve all pending orders.
 * @route GET /api/pending-orders
 * @returns {Object} 200 - Object containing a list of pending orders.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/pending-orders', async (req, res) => {
    try {
        const pendingOrders = await db.getPendingOrders();
        res.json({ orders: pendingOrders });
    } catch (error) {
        console.error('Failed to fetch pending orders:', error);
        res.status(500).json({ message: 'Failed to fetch pending orders', error: error.message });
    }
});



/**
 * Update the status of a specific order.
 * @route PUT /api/order-status/:orderId
 * @param {string} orderId - The ID of the order to update.
 * @bodyParam {string} newStatus - The new status to set for the order.
 * @returns {Object} 200 - Confirmation message with the updated order.
 * @returns {Object} 404 - Error message if the order is not found.
 * @returns {Object} 500 - Server error message.
 */
app.put('/api/order-status/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { newStatus } = req.body;

    try {
        // Await the database update and check for an update result
        const updatedOrder = await db.updateOrderStatus(orderId, newStatus);

        if (updatedOrder) {
            await res.status(200).json({ message: 'Order status updated successfully', updatedOrder });
        } else {
            await res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        await res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
});

/**
 * Link a Google account to an existing employee account.
 * @route POST /api/link-google
 * @bodyParam {string} googleId - The Google account ID to link.
 * @bodyParam {number} employeeId - The ID of the employee to link.
 * @returns {Object} 200 - Confirmation message with updated employee details.
 * @returns {Object} 404 - Error message if the employee is not found.
 * @returns {Object} 500 - Server error message.
 */
app.post('/api/link-google', async (req, res) => {
    const { googleId, employeeId } = req.body;

    try {
        const updatedEmployee = await db.linkGoogleAccount(googleId, employeeId);
        if (updatedEmployee) {
            res.status(200).json({ message: 'Google account linked successfully.', employee: updatedEmployee });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        console.error('Failed to link Google account:', error);
        res.status(500).json({ message: 'Failed to link Google account' });
    }
});

/**
 * Retrieve a user by their Google ID.
 * @route GET /api/get-user-by-google/:googleId
 * @param {string} googleId - The Google ID of the user to retrieve.
 * @returns {Object} 200 - Object containing user information.
 * @returns {Object} 404 - Error message if the user is not found.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/get-user-by-google/:googleId', async (req, res) => {
    const { googleId } = req.params;
    try {
        const user = await db.findUserByGoogleId(googleId);
        if (user) {
            res.json({ user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user by Google ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Google authentication callback route.
 * @route GET /api/auth/callback/google
 * @returns {string} 200 - Confirmation message indicating the callback route is working.
 */
app.get('/api/auth/callback/google', (req, res) => {
    console.log('Received request at /api/auth/callback/google');
    res.send('Callback route is working.');
});

/**
 * Retrieve the statuses of all orders.
 * @route GET /api/orders-status
 * @returns {Object} 200 - Object containing order statuses.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/orders-status', async (req, res) => {
    try {
        const orders = await db.getOrderStatuses();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders status', error: error.message });
    }
});



/**
 * Handle customer points and discounts during cash-out.
 * @route POST /api/cashout
 * @bodyParam {string} name - The name of the customer (optional).
 * @bodyParam {string} email - The email of the customer (optional).
 * @bodyParam {string} phone_number - The phone number of the customer (optional).
 * @bodyParam {number} totalPrice - The total price of the order.
 * @returns {Object} 200 - Object containing final price, discount status, and remaining points.
 * @returns {Object} 500 - Server error message.
 */
app.post('/api/cashout', async (req, res) => {
    const { name, email, phone_number, totalPrice } = req.body;
  
    try {
      let customer;
      let discount = 0;
      let points = 0;

      if (email) {
        // Existing customer: Look up by email
        customer = await db.getCustomerByEmail(email);

        if (customer) {
          // Add 5 points to the existing points
          points = customer.points + 5;

          // Apply discount if points >= 25
          if (points >= 25) {
            discount = 0.10; // 10% discount
            points -= 25;    // Deduct used points
          }

          // Update points in the database
          await db.updateCustomerPoints(email, points);
        } else {
          // New customer: Add to the database with 5 points
          customer = await db.addCustomer(name, email, phone_number);
          points = 5; // New customer starts with 5 points
        }
      } else {
        // No email provided: Treat as anonymous customer, no points accumulated
        points = 0;
      }

      // Calculate the final price after discount
      const finalPrice = discount ? totalPrice * (1 - discount) : totalPrice;

      // Send the response back to the kiosk view
      res.json({
        success: true,
        finalPrice,
        discountApplied: discount > 0,
        remainingPoints: points,
      });
    } catch (error) {
      console.error('Error handling cash-out:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * Add a new customer to the system.
 * @route POST /api/customers
 * @bodyParam {string} name - The name of the customer.
 * @bodyParam {string} email - The email of the customer.
 * @bodyParam {string} phone_number - The phone number of the customer.
 * @returns {Object} 201 - Object containing the newly added customer's details.
 * @returns {Object} 500 - Server error message.
 */
app.post('/api/customers', async (req, res) => {
    const { name, email, phone_number } = req.body;
    try {
        const newCustomer = await db.addCustomer(name, email, phone_number);
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: 'Error adding customer', error: error.message });
    }
});


/**
 * Retrieve the current highest order ID.
 * @route GET /api/highest-order-id
 * @returns {Object} 200 - Object containing the highest order ID.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/highest-order-id', async (req, res) => {
    try {
      // Call the function to get the highest order ID
      const highestOrderId = await db.getHighestOrderId();
      
      // Send the result back as JSON
      res.status(200).json({
        success: true,
        highestOrderId,
      });
    } catch (error) {
      console.error('Error fetching highest order ID:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch the highest order ID.',
      });
    }
});

/**
 * Delete a specific order item.
 * @route DELETE /api/delete-order-item
 * @bodyParam {number} orderId - The ID of the order containing the item.
 * @bodyParam {number} menu_item_id - The ID of the menu item to delete.
 * @returns {Object} 200 - Confirmation message with deleted item details.
 * @returns {Object} 400 - Error message for missing required parameters.
 * @returns {Object} 500 - Server error message.
 */
app.delete('/api/delete-order-item', async (req, res) => {
    console.log('Received DELETE request');
    const { orderId, menu_item_id } = req.body;
  
    if (!orderId || !menu_item_id) {
      return res.status(400).json({ message: 'Both order_id and menu_item_id are required' });
    }
  
    try {
      const deletedItem = await db.deleteOrderItem(orderId, menu_item_id);
      res.status(200).json({ message: 'Order item deleted successfully', deletedItem });
    } catch (error) {
      console.error('Error deleting order item:', error);
      res.status(500).json({ message: 'Failed to delete order item' });
    }
});  

/**
 * Retrieve menu items for a specific order.
 * @route GET /api/order-items/:orderId
 * @param {string} orderId - The ID of the order to retrieve menu items for.
 * @returns {Object} 200 - Object containing a list of menu items.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/order-items/:orderId', async (req, res) => {
    const { orderId } = req.params;
  
    try {
      // Fetch menu items associated with the given order_id
      const menuItems = await db.getMenuItemsByOrderId(orderId);
  
      res.json({
        menuItems,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching menu items.',
        error: error.message,
      });
    }
});

/**
 * Update the unit cost of an inventory item.
 * @route PUT /api/update-unit-cost
 * @bodyParam {number} inventoryId - The ID of the inventory item.
 * @bodyParam {number} newUnitCost - The new unit cost to set.
 * @returns {Object} 200 - Confirmation message with updated item details.
 * @returns {Object} 400 - Error message for missing or invalid parameters.
 * @returns {Object} 404 - Error message if the item is not found.
 * @returns {Object} 500 - Server error message.
 */
app.put('/api/update-unit-cost', async (req, res) => {
    try {
      const { inventoryId, newUnitCost } = req.body;

      if (!inventoryId || newUnitCost === undefined) {
        return res.status(400).json({ message: 'Invalid request. Missing inventoryId or newUnitCost.' });
      }

      const updatedItem = await db.updateUnitCost(inventoryId, newUnitCost);

      if (!updatedItem) {
        return res.status(404).json({ message: 'Inventory item not found.' });
      }

      res.status(200).json({ message: 'Unit cost updated successfully.', updatedItem });
    } catch (error) {
      console.error('Error updating unit cost:', error.message);
      res.status(500).json({ message: 'An error occurred while updating unit cost.' });
    }
});

/**
 * Delete an inventory item by name.
 * @route POST /api/inventory/delete-item
 * @bodyParam {string} name - The name of the inventory item to delete.
 * @returns {Object} 200 - Confirmation message for successful deletion.
 * @returns {Object} 404 - Error message if the item is not found.
 * @returns {Object} 500 - Server error message.
 */
app.post('/api/inventory/delete-item', async (req, res) => {
    const { name } = req.body;
    try {
      const result = await db.deleteInventoryItem(name);
      if (result.rowCount > 0) {
        res.json({ message: 'Item deleted successfully.' });
      } else {
        res.status(404).json({ message: 'Item not found.' });
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
});


/**
 * Retrieve the menu_item_id given its name.
 * @route GET /api/get-item-id-by-name/:name
 * @param {string} name - The name of the menu item.
 * @returns {Object} 200 - Object containing the menu_item_id.
 * @returns {Object} 404 - Error message if the item is not found.
 * @returns {Object} 500 - Server error message.
 */
app.get('/api/get-item-id-by-name/:name', async (req, res) => {
    const { name } = req.params
    try {
        const menuItemId = await db.getMenuItemIdByName(name);
        if (menuItemId) {
            res.json({ menu_item_id: menuItemId });
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        console.error('Error fetching menu_item_id by name:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Set a new calorie value for a menu item.
 * @route POST /api/set-calories
 * @bodyParam {number} id - The ID of the menu item.
 * @bodyParam {number} calories - The new calorie value to set.
 * @returns {Object} 201 - Object containing the updated menu item.
 * @returns {Object} 500 - Server error message.
 */
app.post('/api/set-calories', async (req, res) => {
    const { id, calories } = req.body;
    console.log('Received data:', { id, calories });

    try {
        const updatedItem = await db.updateMenuItemCalories(id, calories);
        res.status(201).json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Error updating item', error: error.message });
    }
});

/**
 * Update the wage of an employee.
 * @route POST /api/set-wage
 * @bodyParam {number} id - The ID of the employee.
 * @bodyParam {number} wage - The new wage value to set.
 * @returns {Object} 200 - Object containing the updated employee wage.
 * @returns {Object} 400 - Error message for missing required parameters.
 * @returns {Object} 500 - Server error message.
 */
app.post('/api/set-wage', async (req, res) => {
    const { id, wage } = req.body;


    if (!id || !wage) {
        return res.status(400).json({ message: 'Employee ID and wage are required' });
    }

    console.log('Received data:', { id, wage });

    try {
        const updatedWage = await db.updateEmployeeWage(id, wage);
        res.status(200).json(updatedWage);
    } catch (error) {
        console.error('Error updating employee wage:', error);
        res.status(500).json({ message: 'Error updating employee wage', error: error.message });
    }
});

/**
 * Start the server and listen on the specified port.
 * @route N/A
 * @returns {void}
 */
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
