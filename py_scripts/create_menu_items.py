import csv

input_file = r"C:\Users\amsantia\Desktop\331\Panda POS\menu_items.txt"
output_file = r"C:\Users\amsantia\Desktop\331\Panda POS\menu_items.sql"


with open(output_file, 'w') as sql_file:
    # Create inventory table in SQL
    sql_file.write("CREATE TABLE menu_items (\n")
    sql_file.write("    menu_item_id INT PRIMARY KEY,\n")
    sql_file.write("    menu_item_name VARCHAR(100),\n")
    sql_file.write("    menu_item_type VARCHAR(100),\n")
    sql_file.write("    menu_item_description VARCHAR(200),\n")
    sql_file.write("    menu_item_spice BOOLEAN,\n")
    sql_file.write("    menu_item_woksmart BOOLEAN,\n")
    sql_file.write("    menu_item_calories INT,\n")
    sql_file.write("    menu_price_small FLOAT,\n")
    sql_file.write("    menu_price_medium FLOAT,\n")
    sql_file.write("    menu_price_large FLOAT,\n")
    sql_file.write("    menu_price_bowl FLOAT,\n")
    sql_file.write("    menu_price_plate FLOAT,\n")
    sql_file.write("    menu_price_bplate FLOAT,\n")
    sql_file.write("    menu_item_status BOOLEAN\n")
    sql_file.write(");\n\n")

    sql_file.write("INSERT INTO menu_items (menu_item_id, menu_item_name, menu_item_type, menu_item_description, menu_item_spice, menu_item_woksmart, menu_item_calories, menu_price_small, menu_price_medium, menu_price_large, menu_price_bowl, menu_price_plate, menu_price_bplate, menu_item_status) VALUES \n")

    with open(input_file, 'r') as menu_file:
        reader = csv.reader(menu_file, delimiter=' ', quotechar='"')
        menu_item_id = 1
        rows = list(reader)

        # loop through each row in the input file and grab data for each menu item
        for i, row in enumerate(rows):
            menu_name = row[0]
            menu_type = row[1]
            menu_desc = row[2]
            menu_spice = row[3]
            menu_wok = row[4]
            menu_cal = row[5]
            menu_price_s = row[6]
            menu_price_m = row[7]
            menu_price_l = row[8]
            menu_price_bowl = row[9]
            menu_price_plate = row[10]
            menu_price_bplate = row[11]


            # create the insert statement for each item
            sql_file.write(f"({menu_item_id}, '{menu_name}', '{menu_type}', '{menu_desc}', {menu_spice}, {menu_wok}, {menu_cal}, {menu_price_s}, {menu_price_m}, {menu_price_l}, {menu_price_bowl}, {menu_price_plate}, {menu_price_bplate}, True)")

            # add a comma if it's not the last item
            if i < len(rows) - 1:
                sql_file.write(",\n")
            else:
                sql_file.write(";\n")
            
            menu_item_id += 1

print("SQL file created and written successfully.")