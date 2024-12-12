/**
 * Database operations module. 
 * 
 * @author Alexis Santiago, Emily Abraham, Jane Landrum, Sonika Madhu, Yuexin Zhang
 * @description This module defines functions to interact with the PostgreSQL databse.
 * 
 */

const { Pool } = require('pg');
require('dotenv').config(); 

// Initialize a connection pool using environment variables
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});


/**
 * Retrive a menu item by its ID.
 * 
 * @async
 * @param {number} id - The ID of the menu item to retrieve. 
 * @returns {Promise<Object|null>} If found, resolve to the menu item object, 'null' if not found.
 * @throws {Error} If there is an issue executing the database query. 
 */
const getMenuItemById = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM menu_items WHERE menu_item_id = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu item');
    }
}

/**
 * Retrieve all menu items sorted by type.
 * 
 * @async
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of menu item objects, each including:
 *   - `menu_item_id`
 *   - `menu_item_name`
 *   - `menu_item_type`
 *   - `menu_item_spice`
 *   - `menu_item_woksmart`
 *   - `menu_item_calories`
 * @throws {Error} If there is an issue executing the database query.
 */
const getMenuItemNames = async () => {
    try {
        const result = await pool.query(`
            SELECT menu_item_id, menu_item_name, menu_item_type, menu_item_spice, menu_item_woksmart, menu_item_calories
            FROM menu_items 
            WHERE menu_item_status = true
            ORDER BY 
                CASE 
                    WHEN menu_item_type = 'entree' THEN 1 
                    WHEN menu_item_type = 'side' THEN 2 
                    ELSE 3
                END
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu items');
    }
}

/**
 * Retrive all menu items of a specific type. 
 * 
 * 
 * @async
 * @param {string} item_type - The type of menu items to retrieve (e.g., `entree`, `side`).
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of menu item objects, each including:
 *   - `menu_item_id`
 *   - `menu_item_name`
 *   - `menu_item_spice`
 *   - `menu_item_woksmart`
 *   - `menu_item_calories`
 * @throws {Error} If there is an issue executing the database query.
 */
const getMenuItemsOfType = async (item_type) => {
    try {
        const result = await pool.query(`
            SELECT menu_item_id, menu_item_name, menu_item_spice, menu_item_woksmart, menu_item_calories
            FROM menu_items
            WHERE menu_item_type = $1
        `, [item_type]); // Parameterized query
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu items');
    }
}

/**
 * Retrieve all menu items classified as "spicy."
 * 
 * @async
 * @function getMenuItemOfSpice
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of spicy menu item objects, each including:
 *   - `menu_item_name`
 * @throws {Error} If there is an issue executing the database query.
 */
const getMenuItemOfSpice = async () => {
    try {
        const result = await pool.query(`
            SELECT menu_item_name
            FROM menu_items
            WHERE menu_item_spice = 't'
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu items');
    }
}

/**
 * Retrieve all menu items classified as "Wok Smart."
 * 
 * @async
 * @function getMenuItemOfWokSmart
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of Wok Smart menu item objects, each including:
 *   - `menu_item_name`
 * @throws {Error} If there is an issue executing the database query.
 */
const getMenuItemOfWokSmart = async () => {
    try {
        const result = await pool.query(`
            SELECT menu_item_name
            FROM menu_items
            WHERE menu_item_woksmart = 't'
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu items');
    }
}

/**
 * Retrieve all menu items classified as "premium."
 * 
 * @async
 * @function getMenuItemOfPremium
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of premium menu item objects, each including:
 *   - `menu_item_name`
 * @throws {Error} If there is an issue executing the database query.
 */
const getMenuItemOfPremium = async () => {
    try { //SELECT menu_item_name FROM menu_items WHERE menu_price_small = 6.70
        const result = await pool.query(`
            SELECT menu_item_name
            FROM menu_items
            WHERE menu_price_small = 6.70
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu items');
    } 
}

/**
 * Retrieve additional information about menu items, including allergens.
 * 
 * @async
 * @function getMenuItemInfo
 * @param {string} [item] - The name of the menu item to filter by (optional).
 * @returns {Promise<Array<Object>>} A promise resolving to an array of menu item objects, each including:
 *   - `menu_item_name`
 *   - `menu_item_description`
 *   - `menu_item_calories`
 *   - `allergens` (array of allergen names).
 * @throws {Error} If there is an issue executing the database query.
 */
const getMenuItemInfo =  async (item) => {
    try {
        
        const result = await pool.query(`
            SELECT mi.menu_item_name, mi.menu_item_description, mi.menu_item_calories, COALESCE(array_agg(a.allergen_name), '{}') AS allergens
            FROM menu_items mi
            LEFT JOIN menu_item_allergens mia ON mi.menu_item_id = mia.menu_item_id
            LEFT JOIN allergens a ON mia.allergen_id = a.allergen_id ${item ? `WHERE mi.menu_item_name = $1` : ''}
            GROUP BY mi.menu_item_name, mi.menu_item_description, mi.menu_item_calories
            ORDER BY mi.menu_item_name;
        `, item ? [item] : []);
        
        return result.rows;

    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch additional menu item information');
    }
}

// Function to get menu item ingredients from the inventory
const getMenuItemAvailability =  async (item) => {
    try {  
        const result = await pool.query(`
            SELECT 
                CASE 
                    WHEN COUNT(*) FILTER (
                        WHERE i.quantity = 0
                    ) > 0 THEN false
                    ELSE true
                END AS is_available
            FROM menu_items mi
            INNER JOIN ingredients ing ON mi.menu_item_id = ing.menu_item_id
            INNER JOIN inventory i ON ing.inventory_item_id = i.inventory_id
            WHERE mi.menu_item_name = $1;
        `, [item]);
        
        return result.rows;

    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu item availability');
    }
}

// Function to get prices from menu items
const getPriceFromDatabase = async (item, size) => {
    const query = `
        SELECT
            menu_price_small,
            menu_price_medium,
            menu_price_large,
            menu_price_bowl,
            menu_price_plate,
            menu_price_bplate
        FROM menu_items
        WHERE menu_item_name ILIKE $1
    `;


    try {
        const result = await pool.query(query, [item]);

        if (result.rows.length > 0) {
            const prices = result.rows[0];
            let selectedPrice;


            switch (size.toLowerCase()) {
                case "small":
                    selectedPrice = prices.menu_price_small;
                    break;
                case "medium":
                    selectedPrice = prices.menu_price_medium;
                    break;
                case "large":
                    selectedPrice = prices.menu_price_large;
                    break;
                case "bowl":
                    selectedPrice = prices.menu_price_bowl;
                    break;
                case "plate":
                    selectedPrice = prices.menu_price_plate;
                    break;
                case "bigger_plate":
                    selectedPrice = prices.menu_price_bplate;
                    break;
                default:
                    return "Invalid size";
            }


            return selectedPrice !== null ? selectedPrice.toFixed(2) : "Price not found";
        } else {
            console.log('No price found for item:', item); 
            return "Price not found";
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch price');
    }
}

/**
 * Retrieve the highest menu item ID.
 * 
 * @async
 * @function getHighestMenuItemId
 * @returns {Promise<number>} The highest menu item ID or `0` if no menu items exist.
 * @throws {Error} If there is an issue executing the database query.
 */
async function getHighestMenuItemId() {
    const query = 'SELECT menu_item_id FROM menu_items ORDER BY menu_item_id DESC LIMIT 1';
    try {
        const result = await pool.query(query);
        // Log the result to see what is returned
        console.log('Query result:', result.rows);
        
        // Check if we have any rows returned
        if (result.rows.length === 0) {
            return 0; // Return 0 if no items exist
        }
        return result.rows[0].menu_item_id; // Return the highest menu_item_id
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to get highest menu item ID');
    }
}

/**
 * Insert a new menu item into the database.
 * 
 * @async
 * @function addMenuItem
 * @param {Object} item - The menu item object to insert, including:
 *   - `menu_item_id`
 *   - `name`
 *   - `type`
 *   - `description`
 *   - `spice`
 *   - `woksmart`
 *   - `calories`
 *   - `priceSmall`
 *   - `priceMedium`
 *   - `priceLarge`
 *   - `status`
 * @returns {Promise<number>} The ID of the newly inserted menu item.
 * @throws {Error} If there is an issue executing the database query.
 */
async function addMenuItem(item) {
    const query = `
        INSERT INTO menu_items (
            menu_item_id, menu_item_name, menu_item_type, menu_item_description,
            menu_item_spice, menu_item_woksmart, menu_item_calories,
            menu_price_small, menu_price_medium, menu_price_large,
            menu_price_bowl, menu_price_plate, menu_price_bplate, 
            menu_item_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 4.15, 4.90, 5.65, $11)
    `;
    const values = [
        item.menu_item_id,
        item.name,
        item.type,
        item.description,
        item.spice,
        item.woksmart,
        item.calories,
        item.priceSmall,
        item.priceMedium,
        item.priceLarge,
        item.status
    ];

    try {
        await pool.query(query, values);
        return item.menu_item_id;  // Return the ID used to insert the new item
    } catch (error) {
        console.error('Database insertion error:', error);
        throw new Error('Failed to add new menu item');
    }
}

/**
 * Mark a menu item as inactive by name.
 * 
 * @async
 * @function removeMenuItem
 * @param {string} name - The name of the menu item to remove.
 * @returns {Promise<boolean>} `true` if the menu item was successfully marked as inactive, otherwise `false`.
 * @throws {Error} If there is an issue executing the database query.
 */
async function removeMenuItem(name) {
    const query = `
        UPDATE menu_items
        SET menu_item_status = false
        WHERE menu_item_name = $1
    `;
    try {
        const result = await pool.query(query, [name]);
        return result.rowCount > 0; // Return true if the item was found and updated
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to remove menu item');
    }
}

/**
 * Retrieve the highest employee ID.
 * 
 * @async
 * @function getHighestEmployeeId
 * @returns {Promise<number>} The highest employee ID or `0` if no employees exist.
 * @throws {Error} If there is an issue executing the database query.
 */
async function getHighestEmployeeId() {
    const query = 'SELECT employee_id FROM employees ORDER BY employee_id DESC LIMIT 1';
    try {
        const result = await pool.query(query);
        console.log('Query result:', result.rows);
        
        if (result.rows.length === 0) {
            return 0; 
        }
        return result.rows[0].employee_id;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to get highest menu item ID');
    }
}

/**
 * Insert a new employee into the database.
 * 
 * @async
 * @function addEmployee
 * @param {Object} employee - The employee object to insert, including:
 *   - `employee_id`
 *   - `employee_name`
 *   - `email`
 *   - `phone_number`
 *   - `job_title`
 *   - `wage`
 *   - `hire_date`
 * @returns {Promise<number>} The ID of the newly inserted employee.
 * @throws {Error} If there is an issue executing the database query.
 */
async function addEmployee(employee) {
    const query = `
        INSERT INTO employees (
            employee_id, employee_name, email,
            phone_number, job_title, wage, hire_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
        employee.employee_id,
        employee.employee_name,
        employee.email,
        employee.phone_number,
        employee.job_title,
        employee.wage,
        employee.hire_date
    ];

    try {
        await pool.query(query, values);
        return employee.employee_id;  // Return the ID used to insert the new employee
    } catch (error) {
        console.error('Database insertion error:', error);
        throw new Error('Failed to add new menu item');
    }
}

/**
 * Remove an employee by ID.
 * 
 * @async
 * @function removeEmployee
 * @param {number} employeeId - The ID of the employee to remove.
 * @returns {Promise<boolean>} `true` if the employee was successfully removed, otherwise `false`.
 * @throws {Error} If there is an issue executing the database query.
 */
const removeEmployee = async (employeeId) => {
    try {
        console.log("Attempt to delete employee...");
        const result = await pool.query('DELETE FROM employees WHERE employee_id = $1', [employeeId]);
        if (result.rowCount > 0)
            console.log("Employee deleted.");
        return result.rowCount > 0; // Returns true if the employee was removed
    } catch (error) {
        console.error('Error removing employee:', error);
        throw new Error('Failed to remove employee');
    }
}

/**
 * Fetches daily completed orders for a specific date.
 *
 * @param {string} date - The date for which to fetch the orders (YYYY-MM-DD format).
 * @returns {Promise<Object>} - Returns an object with the list of orders and the total price.
 * @throws {Error} - Throws an error if the database query fails.
 */
async function getDailyOrders(date) {
    const query = `
    SELECT order_id, order_price 
    FROM orders 
    WHERE order_date = $1 AND order_status = 'Completed'
    `;

    
    try {
        const result = await pool.query(query, [date]);

        // Process the results to calculate the total and format the orders
        const orders = result.rows.map(row => ({
            order_id: row.order_id,
            price: parseFloat(row.order_price)
        }));

        // Calculate daily total by summing up the order prices
        const total = orders.reduce((sum, order) => sum + order.price, 0);

        return { orders, total };
    } catch (error) {
        console.error('Database query error:', error.message);
        throw new Error('Failed to get daily orders');
    }
}

/**
 * Fetches hourly sales data for a specific date.
 *
 * @param {string} date - The date for which to fetch hourly sales (YYYY-MM-DD format).
 * @returns {Promise<Array>} - Returns an array of objects containing the hour and total sales.
 * @throws {Error} - Throws an error if the database query fails.
 */
async function getHourlySales(date) {
    const query = `
      SELECT EXTRACT(HOUR FROM order_time) AS hour, SUM(order_price) AS total_sales 
      FROM orders 
      WHERE order_date = $1 AND order_status = 'Completed'
      GROUP BY EXTRACT(HOUR FROM order_time)
      ORDER BY hour ASC
    `;
  
    try {
      const result = await pool.query(query, [date]);
  
      // Format hourly sales results
      const hourlySales = result.rows.map(row => ({
        hour: `${row.hour.toString().padStart(2, '0')}:00`,
        totalSales: parseFloat(row.total_sales)
      }));
  
      return hourlySales;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw new Error('Failed to get hourly sales');
    }
}

/**
 * Fetches a sales report for a given date range.
 *
 * @param {string} startDate - The start date for the report (YYYY-MM-DD format).
 * @param {string} endDate - The end date for the report (YYYY-MM-DD format).
 * @returns {Promise<Array>} - Returns an array of objects containing menu item names and their sales counts.
 * @throws {Error} - Throws an error if the database query fails.
 */
async function getSalesReport(startDate, endDate) {
    const query = `
      SELECT mi.menu_item_name, mi.menu_item_type, COUNT(*) AS item_count
        FROM menu_items mi
        JOIN order_items oi ON mi.menu_item_id = oi.menu_item_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.order_date BETWEEN $1 AND $2
          AND o.order_status = 'Completed'
        GROUP BY mi.menu_item_name, mi.menu_item_type
        ORDER BY 
          CASE mi.menu_item_type
            WHEN 'entree' THEN 1
            WHEN 'side' THEN 2
            WHEN 'appetizer' THEN 3
            WHEN 'drink' THEN 4
            WHEN 'dessert' THEN 5
            ELSE 6
          END;
    `;
    console.log('Executing Query:', query, 'With Parameters:', [startDate, endDate]);
  
    try {
      const result = await pool.query(query, [startDate, endDate]);
      console.log('Query Result:', result.rows);
      return result.rows.map(row => ({
        name: row.menu_item_name,
        count: row.item_count,
      }));
    } catch (error) {
      console.error('Error executing database query:', error.message);
      throw new Error('Failed to fetch sales data');
    }
  }
  

/**
 * Fetches product usage data for a given date range.
 *
 * @param {string} startDate - The start date for the report (YYYY-MM-DD format).
 * @param {string} endDate - The end date for the report (YYYY-MM-DD format).
 * @returns {Promise<Array>} - Returns an array of objects containing inventory item names and total usage.
 * @throws {Error} - Throws an error if the database query fails.
 */
async function getProductUsage(startDate, endDate) {
    const query = `
      SELECT iv.inventory_item_name, SUM(oi.recorded_quantity) AS total_used
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN ingredients ig ON oi.menu_item_id = ig.menu_item_id
      JOIN inventory iv ON ig.inventory_item_id = iv.inventory_id
      WHERE o.order_date BETWEEN $1 AND $2
        AND o.order_status = 'Completed'
      GROUP BY iv.inventory_item_name
      ORDER BY iv.inventory_item_name
    `;
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows.map(row => ({
      name: row.inventory_item_name,
      amountUsed: row.total_used,
    }));
}

/**
 * Fetches restock information for inventory.
 *
 * @returns {Promise<Array>} - Returns an array of objects containing inventory item names, current quantities, and minimum required quantities.
 * @throws {Error} - Throws an error if the database query fails.
 */
async function getRestockReport() {
    const query = `
      SELECT inventory_item_name, quantity, (fill_level * 0.1) AS min_required_quantity
      FROM inventory
      ORDER BY inventory_item_name
    `;
    const result = await pool.query(query);
    return result.rows.map(row => ({
      name: row.inventory_item_name,
      quantity: row.quantity,
      minRequiredQuantity: Math.round(row.min_required_quantity),
    }));
}

/**
 * Restocks inventory items that are below the minimum required quantity.
 *
 * @returns {Promise<number>} - Returns the number of inventory rows updated.
 * @throws {Error} - Throws an error if the database query fails.
 */
async function restockInventory() {
    const query = `
      UPDATE inventory
      SET quantity = fill_level
      WHERE quantity <= fill_level * 0.1
    `;
    const result = await pool.query(query);
    return result.rowCount; // Returns the number of updated rows
}
  
/**
 * Fetches weekly promotions and their associated menu items.
 *
 * @returns {Promise<Array>} - Returns an array of objects containing promo IDs, menu item names, and discount amounts.
 * @throws {Error} - Throws an error if the database query fails.
 */
const getWeeklyPromos = async () => {
    try {
        // Update the query to join promos with the menu_items table to get the name of the discounted item
        const query = await pool.query(
            `SELECT p.promo_id, m.menu_item_name, p.discount_amount
            FROM promos p
            JOIN menu_items m ON p.discounted_item = m.menu_item_id
            WHERE m.menu_item_status = TRUE` 
        );
        console.log('Fetched Promos:', query.rows);
        
        //const [rows] = await db.execute(query);
        return query.rows;
    } catch (error) {
        console.error('Error fetching promos from database:', error);
        throw error;
    }
};

/**
 * Retrieves the highest order ID currently in the orders table.
 *
 * @returns {Promise<number>} - Returns the highest order ID or 0 if no orders exist.
 * @throws {Error} - Throws an error if the database query fails.
 */
async function getHighestOrderId() {
    const query = 'SELECT order_id FROM orders ORDER BY order_id DESC LIMIT 1';
    try {
        const result = await pool.query(query);
       
        // Log the result to see what is returned
        console.log('Query result:', result.rows);
       
        // Check if we have any rows returned
        if (result.rows.length === 0) {
            return 0; // Return 0 if no orders exist
        }
       
        // Return the highest order_id (not menu_item_id)
        return result.rows[0].order_id;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to get highest order ID');
    }
}

/**
 * Creates an empty order row in the orders table.
 *
 * @param {number} employee_id - The ID of the employee creating the order.
 * @returns {Promise<number>} - Returns the new order ID.
 * @throws {Error} - Throws an error if the database query fails.
 */
const createEmptyOrderRow = async (employee_id) => {
    try {
        // Get the highest order ID
        const highestOrderId = await getHighestOrderId();
        const newOrderId = highestOrderId + 1;

        const insertOrderQuery = `
            INSERT INTO orders (order_id, employee_id)
            VALUES ($1, $2) RETURNING order_id;
        `;

        const orderResult = await pool.query(insertOrderQuery, [newOrderId, employee_id]);

        return orderResult.rows[0].order_id;
    } catch (error) {
        console.error("Error creating empty order row:", error);
        throw error;
    }
};

/**
 * Adds order details (price, status) to an existing empty order row.
 *
 * @param {number} employee_id - The ID of the employee creating the order.
 * @param {number} order_price - The total price of the order.
 * @param {string} order_status - The status of the order (e.g., 'Completed', 'Pending').
 * @returns {Promise<number>} - Returns the updated order ID for confirmation.
 * @throws {Error} - Throws an error if the update fails.
 */
const addOrder = async (employee_id, order_price, order_status) => {
    try {
        const orderId = await createEmptyOrderRow(employee_id);

        const insertOrderQuery = `
            UPDATE orders
            SET order_price = $1, order_status = $2, order_date = NOW(), order_time = NOW()
            WHERE order_id = $3
            RETURNING order_id;
        `;

        const orderResult = await pool.query(insertOrderQuery, [
            order_price,
            order_status,
            orderId,
        ]);

        return orderResult.rows[0].order_id;
    } catch (error) {
        console.error("Error in addOrder:", error);
        throw error;
    }
};

/**
 * Retrieves the highest `order_item_id` from the `order_items` table.
 * @returns {Promise<number>} The highest `order_item_id` or 0 if no items exist.
 * @throws Will throw an error if the query fails.
 */
const getHighestOrderItemId = async () => {
    try {
        const result = await pool.query('SELECT MAX(order_item_id) AS max_id FROM order_items');
        return result.rows[0].max_id || 0;  // Return 0 if there are no items
    } catch (error) {
        console.error('Error fetching highest order_item_id:', error);
        throw error;
    }
};

/**
 * Adds order items to the database.
 * @param {number} orderId - The ID of the order.
 * @param {Array<Object>} orderItems - Array of order items to add.
 * @throws Will throw an error if any database query fails.
 */
const addOrderItems = async (orderId, orderItems) => {
    // Get the highest order_item_id
    const highestOrderItemId = await getHighestOrderItemId();

    // Start incrementing from the highest order_item_id
    let currentOrderItemId = highestOrderItemId + 1;

    const orderItemsQuery = `
        INSERT INTO order_items (order_item_id, order_id, menu_item_id, combo, combo_type, item_size, recorded_quantity)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;

    for (const item of orderItems) {
        await pool.query(orderItemsQuery, [
            currentOrderItemId,  // Use the incremented order_item_id
            orderId,  // Order ID from the newly created order row
            item.menu_item_id,
            item.combo || 'f',
            item.combo_type || 'N/A',
            item.item_size || 'N/A',
            item.recorded_quantity,
        ]);
        
        // Increment the order_item_id for the next item
        currentOrderItemId++;
    }
};


/**
 * Fetches all orders with status "Awaiting" and their associated menu items.
 * @returns {Promise<Array<Object>>} Array of pending orders with details.
 * @throws Will throw an error if the query fails.
 */
async function getPendingOrders() {
    const query = `
      SELECT
        o.order_id,
        o.order_date,
        o.order_time,
        o.order_price,
        o.order_status,
        STRING_AGG(mi.menu_item_name, '\n') AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.menu_item_id
      WHERE o.order_status = $1
      GROUP BY o.order_id, o.order_date, o.order_time, o.order_price, o.order_status
    `;
  
    const status = 'Awaiting';
  
    try {
      const { rows } = await pool.query(query, [status]);
      return rows.length > 0 ? rows : [];
    } catch (error) {
      console.error('Database query error while fetching pending orders:', error.message);
      throw new Error('Failed to fetch pending orders');
    }
  }

/**
 * Updates the status of an order to "Processing."
 * @param {number} orderId - The ID of the order.
 * @returns {Promise<Object|null>} The updated order or null if not found.
 * @throws Will throw an error if the query fails.
 */
async function completeOrder(orderId) {
    const query = 'UPDATE orders SET order_status = $1 WHERE order_id = $2 RETURNING *'; // Adjust as needed
    const status = 'Processing'; // New status
    try {
        const { rows } = await pool.query(query, [status, orderId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Database query error while updating order status:', error);
        throw new Error('Failed to update order status');
    }
}
    
/**
 * Updates the status of an order.
 * @param {number} orderId - The ID of the order.
 * @param {string} newStatus - The new status for the order.
 * @returns {Promise<Object|null>} The updated order or null if not found.
 * @throws Will throw an error if the query fails.
 */
async function updateOrderStatus(orderId, newStatus) {
    const query = 'UPDATE orders SET order_status = $1 WHERE order_id = $2 RETURNING *';
    try {
        // Await the query execution
        const { rows } = await pool.query(query, [newStatus, orderId]);

        // Await the return of the row if it exists, otherwise return null
        return await (rows.length > 0 ? rows[0] : null);
    } catch (error) {
        throw new Error('Failed to update order status');
    }
}

/**
 * Fetches the status of all orders, ordered by ID in descending order.
 * @returns {Promise<Array<Object>>} Array of order statuses.
 * @throws Will throw an error if the query fails.
 */
async function getOrderStatuses() {
    const query = `
        SELECT order_id, order_status
        FROM orders
        ORDER BY order_id DESC
    `;

    try {
        const { rows } = await pool.query(query);
        return rows; // Return the rows directly
    } catch (error) {
        console.error('Error fetching order statuses:', error.message);
        throw new Error('Failed to fetch order statuses');
    }
}

/**
 * Retrieves all employee information from the `employees` table.
 * @returns {Promise<Array<Object>>} Array of employees with details.
 * @throws Will throw an error if the query fails.
 */
const getEmployeeInfo = async () => {
    try {
        const result = await pool.query(`
            SELECT employee_id, employee_name, email, phone_number, job_title, wage, hire_date
            FROM employees
            ORDER BY employee_id
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch employee information');
    }
}

/**
 * Fetches all employees who do not have their accounts linked to Google.
 * @returns {Promise<Array<Object>>} Array of employees without Google accounts.
 * @throws Will throw an error if the query fails.
 */
const getEmployeesNotLinked = async () => {
    try {
        const result = await pool.query(`
            SELECT employee_id, employee_name, email, phone_number, job_title, wage, hire_date
            FROM employees
            WHERE google_id IS NULL
            ORDER BY employee_id
        `);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch employee information');
    }
}

/**
 * Updates the inventory based on the order ID.
 * @param {number} orderId - The ID of the order.
 * @throws Will throw an error if the query fails or inventory update fails.
 */
async function updateInventory(orderId) {
    const getMenuItemsQuery = 'SELECT menu_item_id FROM order_items WHERE order_id = $1';
    try {
        const { rows: menuItems } = await pool.query(getMenuItemsQuery, [orderId]);

        if (menuItems.length === 0) {
            console.log(`No menu items found for order ID ${orderId}`);
            return;  
        }

        console.log(`Found ${menuItems.length} menu items for order ID ${orderId}`);

        for (const menuItem of menuItems) {
            const menuItemID = menuItem.menu_item_id;
            console.log(`Processing menu item ID: ${menuItemID}`);

            const getIngredientsQuery = 'SELECT inventory_item_id FROM ingredients WHERE menu_item_id = $1';
            const { rows: ingredients } = await pool.query(getIngredientsQuery, [menuItemID]);

            if (ingredients.length === 0) {
                console.log(`No ingredients found for menu item ID: ${menuItemID}`);
                continue;  
            }

            console.log(`Found ${ingredients.length} ingredients for menu item ID: ${menuItemID}`);

            for (const ingredient of ingredients) {
                const inventoryItemID = ingredient.inventory_item_id;

                const updateInventoryQuery = 'UPDATE inventory SET quantity = quantity - 1 WHERE inventory_id = $1 RETURNING *';
                const { rows: updatedInventory } = await pool.query(updateInventoryQuery, [inventoryItemID]);

                if (updatedInventory.length > 0) {
                    console.log(`Inventory updated for inventory_item_id: ${inventoryItemID}`);
                } else {
                    console.log(`No inventory item found with inventory_id: ${inventoryItemID}`);
                }
            }
        }
    } catch (error) {
        console.error('Error updating inventory:', error);
        throw new Error('Failed to update inventory');
    }
}

/**
 * Fetches the highest `customer_id` from the `customers` table.
 * @returns {Promise<number>} The highest `customer_id` or 0 if no customers exist.
 * @throws Will throw an error if the query fails.
 */
const getHighestCustomerId = async () => {
    try {
        const query = 'SELECT MAX(customer_id) AS max_id FROM customers';
        const result = await pool.query(query);
        return result.rows[0].max_id || 0; // Default to 0 if table is empty
    } catch (error) {
        console.error('Error fetching highest customer ID:', error);
        throw error;
    }
};


/**
 * Fetches customer details by email.
 * @param {string} email - The customer's email address.
 * @returns {Promise<Object|null>} The customer object or null if not found.
 * @throws Will throw an error if the query fails.
 */
const getCustomerByEmail = async (email) => {
    try {
      const query = 'SELECT * FROM customers WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0]; // Returns undefined if no customer found
    } catch (error) {
      console.error('Error fetching customer by email:', error);
      throw error;
    }
};
  
/**
 * Adds a new customer to the database.
 * @param {string} name - The customer's name.
 * @param {string} email - The customer's email address.
 * @param {string} phoneNumber - The customer's phone number.
 * @returns {Promise<Object>} The newly added customer.
 * @throws Will throw an error if the query fails.
 */
const addCustomer = async (name, email, phoneNumber) => {
    try {
        // Get the highest customer ID and increment by 1
        const highestCustomerId = await getHighestCustomerId();
        const newCustomerId = highestCustomerId + 1;

        const query = `
            INSERT INTO customers (customer_id, name, email, phone_number, points)
            VALUES ($1, $2, $3, $4, 5)
            RETURNING *;
        `;
        const values = [newCustomerId, name, email, phoneNumber];
        const result = await pool.query(query, values);

        return result.rows[0]; // Return the newly added customer
    } catch (error) {
        console.error('Error adding new customer:', error);
        throw error;
    }
};

/**
 * Updates a customer's points.
 * @param {string} email - The customer's email address.
 * @param {number} points - The new points value.
 * @returns {Promise<Object>} The updated customer.
 * @throws Will throw an error if the query fails.
 */
const updateCustomerPoints = async (email, points) => {
    try {
      const query = `
        UPDATE customers
        SET points = $1
        WHERE email = $2
        RETURNING *;
      `;
      const result = await pool.query(query, [points, email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating customer points:', error);
      throw error;
    }
};

/**
 * Deletes an order item by `order_id` and `menu_item_id`.
 * @param {number} order_id - The ID of the order.
 * @param {number} menu_item_id - The ID of the menu item.
 * @returns {Promise<Object>} The deleted order item details.
 * @throws Will throw an error if the query fails or the item is not found.
 */
const deleteOrderItem = async (order_id, menu_item_id) => {
    const query = 'DELETE FROM order_items WHERE order_id = $1 AND menu_item_id = $2 RETURNING *;';
    const values = [order_id, menu_item_id];

    try {
      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        throw new Error('Order item not found for the given order ID and menu item ID');
      }
      return result.rows[0]; // Return the deleted order item details
    } catch (error) {
      console.error('Error deleting order item:', error);
      throw new Error('Failed to delete order item');
    }
};  

/**
 * Fetches menu items based on `order_id`.
 * @param {number} orderId - The ID of the order.
 * @returns {Promise<Array<Object>>} Array of menu items with details.
 * @throws Will throw an error if the query fails or no items are found.
 */
const getMenuItemsByOrderId = async (orderId) => {
    try {
      // Query to fetch all order items for the given order_id
      const orderItemsQuery = `
        SELECT menu_item_id 
        FROM order_items
        WHERE order_id = $1;
      `;

      const orderItemsResult = await pool.query(orderItemsQuery, [orderId]);

      // If no items are found for this order_id
      if (orderItemsResult.rows.length === 0) {
        throw new Error('No items found for this order ID.');
      }

      const menuItemIds = orderItemsResult.rows.map(row => row.menu_item_id);

      // Query to fetch menu item names for each menu_item_id
      const menuItemsQuery = `
        SELECT menu_item_id, menu_item_name
        FROM menu_items
        WHERE menu_item_id = ANY($1);
      `;
      
      const menuItemsResult = await pool.query(menuItemsQuery, [menuItemIds]);
      return menuItemsResult.rows; // Return the list of menu items
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error; // Rethrow error to be handled by API route
    }
};

/**
 * Updates the unit cost for an inventory item.
 * @param {number} inventoryId - The ID of the inventory item.
 * @param {number} newUnitCost - The new unit cost.
 * @returns {Promise<Object>} The updated inventory item.
 * @throws Will throw an error if the query fails.
 */
const updateUnitCost = async (inventoryId, newUnitCost) => {
    try {
      const query = `
        UPDATE inventory
        SET unit_cost_to_order = $1
        WHERE inventory_id = $2
        RETURNING *;
      `;
      const values = [newUnitCost, inventoryId];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating unit cost to order:', error.message);
    }
};

/**
 * Deletes an item from the inventory.
 * @param {string} name - The name of the inventory item.
 * @returns {Promise<Object>} Details of the deleted inventory item.
 * @throws Will throw an error if the query fails.
 */
async function deleteInventoryItem(name) {
    const query = 'DELETE FROM inventory WHERE inventory_item_name = $1 RETURNING *';
    const values = [name];
    
    try {
      const result = await pool.query(query, values);
      return result; 
    } catch (err) {
      throw err; 
    }
}

/**
 * Links a Google account to an existing user.
 * @param {string} googleId - The Google ID to link.
 * @param {number} employeeId - The ID of the employee.
 * @returns {Promise<Object|null>} The updated employee or null if not found.
 * @throws Will throw an error if the query fails.
 */
async function linkGoogleAccount(googleId, employeeId) {
    const query = 'UPDATE employees SET google_id = $1 WHERE employee_id = $2 RETURNING *';
    try {
        const { rows } = await pool.query(query, [googleId, employeeId]);
        return rows.length > 0 ? rows[0] : null; // Return the updated user, or null if not found
    } catch (error) {
        console.error('Database query error while linking Google account:', error);
        throw new Error('Failed to link Google account');
    }
}

/**
 * Finds a user by their Google ID.
 * @param {string} googleId - The Google ID to search for.
 * @returns {Promise<Object|null>} The user object or null if not found.
 * @throws Will throw an error if the query fails.
 */
async function findUserByGoogleId(googleId) {
    const query = 'SELECT * FROM employees WHERE google_id = $1';
    try {
        const { rows } = await pool.query(query, [googleId]);
        return rows.length > 0 ? rows[0] : null; 
    } catch (error) {
        console.error('Database query error while checking user:', error);
        throw new Error('Failed to check user in the database');
    }
}

/**
 * Fetches the menu item ID for a given menu item name.
 * 
 * @param {string} name - The name of the menu item.
 * @returns {Promise<number|null>} - The menu item ID if found, otherwise null.
 * @throws {Error} - If the database query fails.
 */
async function getMenuItemIdByName(name) {
    const query = 'SELECT menu_item_id FROM menu_items WHERE menu_item_name = $1';
    try {
        const { rows } = await pool.query(query, [name]); 
        return rows.length > 0 ? rows[0].menu_item_id : null;
    } catch (error) {
        console.error('Database query error while fetching menu_item_id:', error);
        throw new Error('Failed to fetch menu_item_id from the database');
    }
}

/**
 * Updates the calorie count of a menu item based on its ID.
 * 
 * @param {number} id - The ID of the menu item to update.
 * @param {number} calories - The new calorie count to set for the menu item.
 * @returns {Promise<Object>} - The updated menu item details.
 * @throws {Error} - If the database query fails.
 */
const updateMenuItemCalories = async (id, calories) => {
    try {
      const query = `
        UPDATE menu_items
        SET menu_item_calories = $1
        WHERE menu_item_id = $2
        RETURNING *;
      `;
      const result = await pool.query(query, [calories, id]);  // Pass both calories and id
      return result.rows[0]; 
    } catch (error) {
      console.error('Error updating menu item calories:', error);
      throw error;
    }
};

/**
 * Updates the wage of an employee based on their ID.
 * 
 * @param {number} id - The ID of the employee to update.
 * @param {number} wage - The new wage to set for the employee.
 * @returns {Promise<Object>} - The updated employee details.
 * @throws {Error} - If the employee is not found or the database query fails.
 */
const updateEmployeeWage = async (id, wage) => {
    try {
        const query = `
            UPDATE employees
            SET wage = $1
            WHERE employee_id = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [wage, id]);  // Pass both wage and id
        if (result.rows.length === 0) {
            throw new Error('Employee not found');
        }
        return result.rows[0]; 
    } catch (error) {
        console.error('Error updating employee wage:', error);
        throw error;
    }
};

// Export your functions using CommonJS syntax
module.exports = {
    getMenuItemById,
    getMenuItemNames,
    getMenuItemsOfType,
    getMenuItemOfSpice,
    getMenuItemOfWokSmart,
    getMenuItemOfPremium,
    getMenuItemInfo,
    getMenuItemAvailability,
    getPriceFromDatabase,
    getHighestMenuItemId,
    getHighestCustomerId,
    addMenuItem,
    removeMenuItem,
    getEmployeeInfo,
    getHighestEmployeeId,
    addEmployee,
    removeEmployee,
    deleteInventoryItem,
    getDailyOrders,
    getWeeklyPromos,
    getHourlySales,
    getSalesReport,
    getProductUsage,
    getRestockReport,
    restockInventory,
    getHighestOrderId,
    addOrder,
    addOrderItems,
    createEmptyOrderRow,
    getPendingOrders,
    linkGoogleAccount,
    findUserByGoogleId,
    updateOrderStatus,
    getOrderStatuses,
    updateInventory,
    getCustomerByEmail,
    addCustomer,
    updateCustomerPoints,
    completeOrder,
    deleteOrderItem,
    getMenuItemsByOrderId,
    updateUnitCost,
    getEmployeesNotLinked,
    getMenuItemIdByName,
    updateMenuItemCalories,
    updateEmployeeWage,
};
