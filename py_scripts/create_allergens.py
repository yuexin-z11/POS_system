output_file = r"C:\Users\amsantia\Desktop\331\Panda POS\allergens.sql"


with open(output_file, 'w') as sql_file:
    # Create inventory table in SQL
    sql_file.write("CREATE TABLE allergens (\n")
    sql_file.write("    allergen_id INT PRIMARY KEY,\n")
    sql_file.write("    allergen_name VARCHAR(100)\n")
    sql_file.write(");\n\n")

    sql_file.write("INSERT INTO allergens (allergen_id, allergen_name) VALUES \n")

    allergen_data = [
        (1, 'wheat'),
        (2, 'soy'),
        (3, 'treenuts'),
        (4, 'fish'),
        (5, 'peanuts'),
        (6, 'shellfish'),
        (7, 'eggs'),
        (8, 'milk'),
        (9, 'sesame (sesame oil)'),
        ]


    # create the insert statement for each item
    sql_insert_data = ",\n".join([f"({allergen_id}, '{allergen_name}')" for allergen_id, allergen_name in allergen_data])
    sql_file.write(sql_insert_data)
    sql_file.write(";\n")

print("SQL file created and written successfully.")