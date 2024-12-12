const { Pool } = require('pg'); // Use require for importing
require('dotenv').config(); // Load environment variables from .env file

// Initialize a connection pool using environment variables
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432, // Default to 5432 if not set
});

//console.log('DB_HOST:', process.env.DB_HOST);
//console.log('DB_USER:', process.env.DB_USER);


// Function to get menu item by ID
const getMenuItemById = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM menu_items WHERE menu_item_id = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu item');
    }
};

// Function to get all menu items sorted by type (only active ones)
const getMenuItemNames = async () => {
    try {
        const result = await pool.query(`
            SELECT menu_item_name, menu_item_type, menu_item_spice, menu_item_woksmart 
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
};


// Function to get all menu items of a particular type
const getMenuItemsOfType = async (item_type) => {
    try {
        const result = await pool.query(`
            SELECT menu_item_name, menu_item_spice, menu_item_woksmart 
            FROM menu_items
            WHERE menu_item_type = $1
        `, [item_type]); // Parameterized query
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch menu items');
    }
};

// Function to get all menu items classified as 'spicy'           --WIP
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

// Function to get all menu items classified as 'wok smart'           --WIP
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


// Function to get all menu items classified as 'premium'           --WIP
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
        console.log('Query executed:', query, 'with parameter:', item); // Log the executed query


        if (result.rows.length > 0) {
            const prices = result.rows[0];
            console.log('Prices fetched:', prices); // Log the fetched prices
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
                case "bigger plate":
                    selectedPrice = prices.menu_price_bplate;
                    break;
                default:
                    return "Invalid size";
            }


            return selectedPrice !== null ? selectedPrice.toFixed(2) : "Price not found";
        } else {
            console.log('No price found for item:', item); // Log if no rows were returned
            return "Price not found";
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Failed to fetch price');
    }
};

// Function to get an employee's info given their email and id
async function authenticateUser(email, customer_id) {
    const query = 'SELECT * FROM employees WHERE email = $1 AND employee_id = $2'; // Use $1, $2 for PostgreSQL
    try {
        const { rows } = await pool.query(query, [email, customer_id]); // Use pool.query with the correct syntax
        return rows.length > 0 ? rows[0] : null; // Return the first user found, or null if not found
    } catch (error) {
        console.error('Database query error during authentication:', error); // Log the error
        throw new Error('Failed to authenticate user'); // Throw a meaningful error
    }
}


// Function to get the highest menu item ID
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

// Function to insert a new menu item
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

// Function to remove a menu item (aka mark its status as inactive)
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


// Export your functions using CommonJS syntax
module.exports = {
    getMenuItemById,
    getMenuItemNames,
    getMenuItemsOfType,
    getMenuItemOfSpice,
    getMenuItemOfWokSmart,
    getMenuItemOfPremium,
    getPriceFromDatabase,
    authenticateUser,
    getHighestMenuItemId,
    addMenuItem,
    removeMenuItem
};
