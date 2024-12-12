output_file = r"C:\Users\amsantia\Desktop\331\Panda POS\menu_item_allergens.sql"


with open(output_file, 'w') as sql_file:
    # Create inventory table in SQL
    sql_file.write("CREATE TABLE menu_item_allergens (\n")
    sql_file.write("    item_allergen_id INT PRIMARY KEY,\n")
    sql_file.write("    allergen_id INT,\n")
    sql_file.write("    menu_item_id INT,\n")
    sql_file.write("    FOREIGN KEY (allergen_id) REFERENCES allergens(allergen_id),\n")
    sql_file.write("    FOREIGN KEY (menu_item_id) REFERENCES menu_items(menu_item_id)\n")
    sql_file.write(");\n\n")

    sql_file.write("INSERT INTO menu_item_allergens (item_allergen_id, allergen_id, menu_item_id) VALUES \n")

    #First int is iten_allergen_ID, second is allergen_ID, third is menu_item_ID to pair the two
    item_allergen_data = [
        (1, 1, 1), #wheat
        (2, 1, 2),
        (3, 1, 3),
        (4, 1, 4),
        (5, 1, 5),
        (6, 1, 6),
        (7, 1, 7),
        (8, 1, 8),
        (9, 1, 9),
        (10, 1, 10),
        (11, 1, 11),
        (12, 1, 12),
        (13, 1, 13),
        (14, 1, 14),
        (15, 1, 15),
        (16, 1, 16),
        (17, 1, 18),
        (18, 1, 19),
        (19, 1, 20),
        (20, 1, 21),
        (21, 1, 22),
        (22, 2, 1), #soy
        (23, 2, 2),
        (24, 2, 4),
        (25, 2, 5),
        (26, 2, 6),
        (27, 2, 7),
        (28, 2, 9),
        (29, 2, 11),
        (30, 2, 12),
        (31, 2, 13),
        (32, 2, 14),
        (33, 2, 15),
        (34, 2, 16),
        (35, 2, 18),
        (36, 2, 19),
        (37, 3, 7), #treenuts
        (38, 5, 4), #peanuts
        (39, 6, 7), #shellfish
        (40, 7, 1), #eggs
        (41, 7, 7),
        (42, 7, 12),
        (43, 7, 15),
        (44, 7, 18),
        (45, 7, 20),
        (46, 8, 1), #milk
        (47, 8, 7),
        (48, 8, 18),
        (49, 8, 20),
        (50, 9, 1), #sesame
        (51, 9, 3),
        (52, 9, 4),
        (53, 9, 5),
        (54, 9, 8),
        (55, 9, 9),
        (56, 9, 11),
        (57, 9, 12),
        (58, 9, 13),
        (59, 9, 14),
        (60, 9, 15),
        (61, 9, 18),
    ]
    

    # create the insert statement for pair
    sql_insert_data = ",\n".join([f"({item_allergen_id}, {allergen_id}, {menu_item_id})" for item_allergen_id, allergen_id, menu_item_id in item_allergen_data])
    sql_file.write(sql_insert_data)
    sql_file.write(";\n")

print("SQL file created and written successfully.")