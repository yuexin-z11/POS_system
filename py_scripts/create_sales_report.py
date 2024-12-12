from datetime import datetime, timedelta
import random

# Assuming an estimated number of orders (update this manually based on Orders script)
estimated_order_count = 63972  # This should be adjusted based on actual orders count

# Define file path for Sales Report
output_file_sales = r"/home/janelandrum/csce331/p3_database/sql_files/sales_report.sql"

# start date: about a year ago
start_date = datetime(2023, 9, 17)
num_weeks = 52

# Open the SQL file for writing the Sales Report
with open(output_file_sales, 'w') as sql_file:
    sql_file.write("CREATE TABLE Sales_Report (\n")
    sql_file.write("    Sales_Report_ID SERIAL PRIMARY KEY,\n")
    sql_file.write("    Order_ID INT,\n")
    sql_file.write("    Revenue NUMERIC(10, 2),\n")
    sql_file.write("    Sales_Report_Date DATE,\n")
    sql_file.write("    FOREIGN KEY (Order_ID) REFERENCES Orders(Order_ID)\n")
    sql_file.write(");\n\n")

    # Assuming the same number of Sales Reports as Orders, loop to insert Sales Reports
    sql_file.write("INSERT INTO Sales_Report (Sales_Report_ID, Order_ID, Revenue, Sales_Report_Date) VALUES \n")
    sales_entries = []  # list to hold each sales report entry
    for i in range(1, estimated_order_count + 1):  # using a manual estimate for count of orders
        revenue = round(random.uniform(50, 200), 2)  # assuming revenue correlates with order price
        date = start_date + timedelta(weeks=random.randint(0, num_weeks-1))  # random date within the year
        sales_entries.append(f"({i}, {i}, {revenue}, '{date.strftime('%Y-%m-%d')}')")
    
    # Write all entries to the SQL file, separated by commas
    sql_file.write(",\n".join(sales_entries) + ";\n")

print("Sales Report SQL file created and written successfully.")


