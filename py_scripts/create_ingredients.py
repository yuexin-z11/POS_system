output_file = r"/home/janelandrum/csce331/p3_database/sql_files/ingredients.sql"


with open(output_file, 'w') as sql_file:
    sql_file.write("CREATE TABLE ingredients (\n")
    sql_file.write("    ingredient_id INT PRIMARY KEY,\n")
    sql_file.write("    FOREIGN KEY (inventory_item_id) REFERENCES inventory(inventory_id),\n")
    sql_file.write("    FOREIGN KEY (menu_item_id) REFERENCES menu_items(menu_item_id)\n")
    sql_file.write(");\n\n")

    sql_file.write("INSERT INTO ingredients (ingredient_id, inventory_item_id, menu_item_id) VALUES \n")

    #First int is ingredient_ID, second is inventory_ID, third is menu_item_ID to pair the two
    ingredient_data = [
        (1, 1, 1), #chicken
        (2, 1, 3),
        (3, 1, 4),
        (4, 1, 5),
        (5, 1, 8),
        (6, 1, 10),
        (7, 1, 11),
        (8, 1, 12),
        (9, 1, 13),
        (10, 1, 18),
        (11, 2, 6), #mushroom
        (12, 2, 11),
        (13, 3, 4), #zucchini
        (14, 3, 11),
        (15, 4, 2), #beef
        (16, 4, 6),
        (17, 4, 9),
        (18, 5, 7), #shrimp
        (19, 6, 14), #noodles
        (20, 7, 15), #mixed vegetables
        (21, 7, 19),
        (22, 8, 15), #white rice
        (23, 8, 17),
        (24, 9, 1), #eggs
        (25, 9, 7),
        (26, 9, 12),
        (27, 9, 18),
        (28, 9, 20),
        (29, 10, 15), #peas
        (30, 11, 15), #carrots
        (31, 12, 4), #green onion
        (32, 12, 15),
        (33, 12, 18),
        (34, 12, 19),
        (35, 12, 20),
        (36, 13, 1), #soy sauce
        (37, 13, 4),
        (38, 13, 5),
        (39, 13, 6),
        (40, 13, 9),
        (41, 13, 11),
        (42, 13, 13),
        (43, 13, 14),
        (44, 13, 15),
        (45, 13, 16),
        (46, 13, 19),
        (47, 14, 11), #ginger sauce
        (48, 17, 1), #orange sauce
        (49, 18, 3), #honey sesane seed sauce
        (50, 18, 7),
        (51, 19, 6), #black pepper sauce
        (52, 19, 13),
        (53, 21, 14), #cabbage
        (54, 21, 16),
        (55, 21, 18),
        (56, 21, 19),
        (57, 22, 13), #celery
        (58, 22, 14),
        (59, 22, 15),
        (60, 22, 16),
        (61, 22, 19),
        (62, 23, 2), #oil
        (63, 23, 9),
        (64, 23, 14),
        (65, 23, 18),
        (66, 24, 1), #spices
        (67, 24, 3),
        (68, 24, 4),
        (69, 24, 5),
        (70, 24, 7),
        (71, 24, 8),
        (72, 24, 9),
        (73, 24, 10),
        (74, 24, 11),
        (75, 24, 13),
        (76, 24, 14),
        (77, 24, 15),
        (78, 24, 19),
        (79, 25, 8), #green beans
        (80, 26, 2), #bell pepper
        (81, 26, 3),
        (82, 26, 4),
        (83, 26, 6),
        (84, 26, 10),
        (85, 27, 6), #broccoli
        (86, 27, 9),
        (87, 27, 16),
        (88, 28, 7), #glazed walnuts
        (89, 29, 4), #peanut
        (90, 30, 6), #chili peppers
        (91, 31, 2), #onions
        (92, 31, 6),
        (93, 31, 8),
        (94, 31, 10),
        (95, 31, 13),
        (96, 31, 14),
        (97, 31, 18),
        (98, 32, 20), #wonton wrapper
        (99, 33, 20), #cream cheese
        (100, 34, 22), #apples
        (101, 35, 22), #cinnamon
        (102, 36, 21), #fortune cookie
        (103, 37, 24), #bottled water
        (104, 38, 25), #bottled drink
        (106, 39, 23), #fountain drink
    ]
    

    # create the insert statement for pair
    sql_insert_data = ",\n".join([f"({ingredient_id}, {inventory_item_id}, {menu_item_id})" for ingredient_id, inventory_item_id, menu_item_id in ingredient_data])
    sql_file.write(sql_insert_data)
    sql_file.write(";\n")

print("SQL file created and written successfully.")