from datetime import datetime, timedelta
import random

# Define file path for the order_items_report
output_file_order_items = r"/home/janelandrum/csce331/p3_database/sql_files/order_items.sql"

# Number of orders and menu items
num_orders = 63972  # arbitrary number of orders
num_menu_items = 25  # adjust based on number of menu items

with open(output_file_order_items, 'w') as sql_file:
    sql_file.write("CREATE TABLE order_items (\n")
    sql_file.write("    order_item_id INT PRIMARY KEY,\n")
    sql_file.write("    order_id INT,\n")
    sql_file.write("    menu_item_id INT,\n")
    sql_file.write("    combo BOOLEAN,\n")
    sql_file.write("    combo_type VARCHAR(50),\n")
    sql_file.write("    item_size VARCHAR(10),\n")
    sql_file.write("    recorded_quantity INT,\n")
    sql_file.write("    FOREIGN KEY (order_id) REFERENCES orders(order_id),\n")
    sql_file.write("    FOREIGN KEY (menu_item_id) REFERENCES menu_items(menu_item_id)\n")
    sql_file.write(");\n\n")
    
    # Initialize order_item_id
    order_item_id = 1
    order_items_entries = []

    # Define possible combo types and sizes
    combo_types = ['Bowl', 'Plate', 'Bigger Plate', 'A la carte']
    item_size = ['Small', 'Medium', 'Large']

    # Generate random entries for order items
    for order_id in range(1, num_orders + 1):  # Loop through each order
        # Randomly decide if the order is a combo or a la carte
        if random.choice([True, False]):  # 50% chance to be a combo
            combo_type = random.choice(combo_types[:-1])  # Exclude 'A la carte'
            if combo_type == 'Bowl':
                sides = 1
                entrees = 1
            elif combo_type == 'Plate':
                sides = 1
                entrees = 2
            elif combo_type == 'Bigger Plate':
                sides = 1
                entrees = 3

            # Record combo item with size and quantity
            order_items_entries.append(f"({order_item_id}, {order_id}, {random.randint(1, num_menu_items)}, True, '{combo_type}', '{random.choice(item_size)}', {sides + entrees})")
            order_item_id += 1  # Increment order_item_id after adding a combo item
        else:  # A la carte
            # Generate a random number of items for a la carte (1 to 5)
            num_items = random.randint(1, 5)
            for _ in range(num_items):
                order_items_entries.append(f"({order_item_id}, {order_id}, {random.randint(1, num_menu_items)}, False, 'N/A', '{random.choice(item_size)}', {random.randint(1, 3)})")
                order_item_id += 1  # Increment for each a la carte item

    # Write all the entries to the SQL file, separated by commas
    sql_file.write("INSERT INTO order_items (order_item_id, order_id, menu_item_id, combo, combo_type, item_size, recorded_quantity) VALUES \n")
    sql_file.write(",\n".join(order_items_entries) + ";\n")

print("Order items report SQL file created and written successfully.")