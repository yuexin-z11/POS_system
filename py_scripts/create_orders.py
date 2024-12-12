from datetime import datetime, timedelta
import random

output_file_orders = r"/home/janelandrum/csce331/p3_database/sql_files/orders.sql"

# Start date and number of weeks for generating data
start_date = datetime(2023, 9, 17)
num_weeks = 52

# Open the SQL file for writing the Orders
with open(output_file_orders, 'w') as sql_file:
    # Create the Orders table
    sql_file.write("CREATE TABLE Orders (\n")
    sql_file.write("    Order_ID SERIAL PRIMARY KEY,\n")
    sql_file.write("    Employee_ID INT,\n")
    sql_file.write("    Order_Date DATE,\n")
    sql_file.write("    Order_Time TIME,\n")
    sql_file.write("    Order_Price NUMERIC(10, 2),\n")
    sql_file.write("    Order_Status VARCHAR(50)\n")
    sql_file.write(");\n\n")
    
    # Loop to insert Orders into the Orders table
    order_id = 1
    orders_entries = []  # list to hold each order entry
    for week in range(num_weeks):
        for day in range(7):
            date = start_date + timedelta(weeks=week, days=day)
            # Randomly generate 150 to 200 orders per day
            for _ in range(random.randint(150, 200)):
                time = datetime.strptime(f"{random.randint(8,20)}:{random.randint(0,59)}:00", '%H:%M:%S')
                price = round(random.uniform(50, 200), 2)
                status = random.choice(['Completed', 'Pending', 'Cancelled'])
                orders_entries.append(f"({order_id}, {random.randint(1,10)}, '{date.strftime('%Y-%m-%d')}', '{time.strftime('%H:%M:%S')}', {price}, '{status}')")
                order_id += 1
    
    # Write all the entries to the SQL file, separated by commas
    sql_file.write("INSERT INTO Orders (Order_ID, Employee_ID, Order_Date, Order_Time, Order_Price, Order_Status) VALUES \n")
    sql_file.write(",\n".join(orders_entries) + ";\n")

print("Orders SQL file created and written successfully.")

