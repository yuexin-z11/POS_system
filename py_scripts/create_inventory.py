import random
import csv

input_file = r"/home/janelandrum/csce331/p3_database/txt_files/inventory_items.txt"
output_file = r"/home/janelandrum/csce331/p3_database/sql_files/inventory.sql"

with open(output_file, 'w') as sql_file:
    sql_file.write("CREATE TABLE inventory (\n")
    sql_file.write("    inventory_id INT PRIMARY KEY, \n")
    sql_file.write("    inventory_item_name VARCHAR(100), \n")
    sql_file.write("    quantity INT, \n")
    sql_file.write("    unit_cost_to_order FLOAT, \n")
    sql_file.write("    fill_level INT, \n")
    sql_file.write("    inventory_item_type VARCHAR(100), \n")
    sql_file.write(");\n\n")

    sql_file.write("INSERT INTO inventory (inventory_id, inventory_item_name, quantity, unit_cost_to_order, fill_level, inventory_item_type) VALUES \n")

    with open(input_file, 'r') as items_file:
        reader = csv.reader(items_file, delimiter=' ', quotechar='"')
        inventory_id = 1
        rows = list(reader)

        # loop through each row in the input file
        for i, row in enumerate(rows):
            item_name = row[0]
            item_type = row[1]
            
            # random values for the other attributes
            quantity = random.randint(50, 100)
            unit_cost_to_order = round(random.uniform(150, 250), 2)
            fill_level = quantity * 2

            # create the insert statement for each item
            sql_file.write(f"    ({inventory_id}, '{item_name}', {quantity}, {unit_cost_to_order}, {fill_level}, '{item_type}')")

            # add a comma if it's not the last item
            if i < len(rows) - 1:
                sql_file.write(",\n")
            else:
                sql_file.write(";\n")
            
            inventory_id += 1

print("SQL file created and written successfully.")