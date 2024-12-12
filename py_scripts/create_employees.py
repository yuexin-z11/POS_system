from faker import Faker
fake = Faker()

output_file = r"/home/janelandrum/csce331/p3_database/sql_files/employees.sql"

with open(output_file, "w") as sql_file:
    sql_file.write("CREATE TABLE employees (\n")
    sql_file.write("    employee_id INT PRIMARY KEY,\n") 
    sql_file.write("    name VARCHAR(100),\n")
    sql_file.write("    email VARCHAR(100),\n")
    sql_file.write("    phone_number VARCHAR(100),\n") 
    sql_file.write("    job_title VARCHAR(100),\n")
    sql_file.write("    wage FLOAT,\n")  
    sql_file.write("    hire_date DATE\n") 
    sql_file.write(");\n\n")
    
    sql_file.write("INSERT INTO employees (employee_id, name, email, phone_number, job_title, wage, hire_date) VALUES \n")
    
    for i in range(1, 16):
        employee_id = i
        name = fake.name()
        first_name, last_name = name.split(" ")[0], name.split(" ")[-1]
        email = f"{first_name.lower()}{last_name.lower()}@example.com"
        phone_number = fake.numerify("###-###-####")
        job_title = 'Employee'
        wage = round(fake.random_number(digits=5) / 100, 2) 
        hire_date = fake.date_between(start_date="-10y", end_date="today")  
        
        sql_file.write(f"    ({employee_id}, '{name}', '{email}', '{phone_number}', '{job_title}', {wage}, '{hire_date}')")
        
        if i < 15:
            sql_file.write(",\n")
        else:
            sql_file.write(";\n")
    
print("SQL file created and written successfully.")
