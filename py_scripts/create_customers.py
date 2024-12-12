from faker import Faker
fake = Faker()

output_file = r"/home/janelandrum/csce331/p3_database/sql_files/customers.sql"

with open(output_file, "w") as sql_file:
    sql_file.write("CREATE TABLE customers (\n")
    sql_file.write("    customer_id INT PRIMARY KEY,\n") 
    sql_file.write("    name VARCHAR(100),\n")
    sql_file.write("    email VARCHAR(100),\n")
    sql_file.write("    phone_number VARCHAR(100),\n")
    sql_file.write("    points INT\n")
    sql_file.write(");\n\n")
    
    sql_file.write("INSERT INTO customers (customer_id, name, email, phone_number, points) VALUES \n")
    
    for i in range(1, 300):
        customer_id = i
        name = fake.name()
        first_name, last_name = name.split(" ")[0], name.split(" ")[-1]
        email = f"{first_name.lower()}{last_name.lower()}@example.com"
        phone_number = fake.numerify("###-###-####")
        points = fake.random_int(min=0, max=100)

        name = name.replace("'", "''")
        
        sql_file.write(f"    ({customer_id}, '{name}', '{email}', '{phone_number}', {points})")
        
        if i < 299:
            sql_file.write(",\n")
        else:
            sql_file.write(";\n")
    
print("SQL file created and written successfully.")
