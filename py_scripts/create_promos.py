import random

output_file = r"/home/janelandrum/csce331/p3_database/sql_files/promos.sql"

with open(output_file, 'w') as sql_file:
    sql_file.write("CREATE TABLE promos (\n")
    sql_file.write("    promo_id INT PRIMARY KEY,\n")
    sql_file.write("    discount_amount FLOAT,\n")
    sql_file.write("    discounted_item INT,\n")
    sql_file.write("    FOREIGN KEY (discounted_item) REFERENCES menu_items(menu_item_id)\n")
    sql_file.write(");\n\n")

    sql_file.write("INSERT INTO promos (promo_id, discount_amount, discounted_item) VALUES \n")

    # list with ids for each item that could have a discount on it (entrees, desserts, and drinks)
    items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 25, 26]
    # list with random generated discounts
    discounts = [round(random.uniform(1, 5), 2) for _ in range(len(items))]

    for i, (item, discount) in enumerate(zip(items, discounts), start=1):
        end_char = ",\n" if i < len(items) else ";\n"
        sql_file.write(f"    ({i}, {discount}, {item}){end_char}")

print("SQL file created and written successfully.")
