from datetime import datetime, timedelta

output_file = r"/home/janelandrum/csce331/p3_database/sql_files/inventory_report.sql"

num_inventory_items = 46  # adjust according to actual inventory size
inventory_ids = [i for i in range(1, num_inventory_items + 1)]  # generate inventory IDs

# start date: about a year ago
start_date = datetime(2023, 9, 17)
num_weeks = 52

with open(output_file, 'w') as sql_file:
    sql_file.write("CREATE TABLE inventory_report (\n")
    sql_file.write("    inventory_report_id INT PRIMARY KEY, \n")
    sql_file.write("    inventory_item_id INT, \n")
    sql_file.write("    inventory_report_date DATE, \n")
    sql_file.write("    recorded_quantity INT, \n")
    sql_file.write("    FOREIGN KEY (inventory_item_id) REFERENCES inventory(inventory_id) \n")
    sql_file.write(");\n\n")

    sql_file.write("INSERT INTO inventory_report (inventory_report_id, inventory_item_id, inventory_report_date, recorded_quantity) VALUES \n")

    # loop through each week and each inventory item
    inventory_report_id = 1
    report_entries = [] # list for each line in the report to be added to the table
    for week in range(num_weeks):
        report_date = start_date + timedelta(weeks=week)  # calculate the report date for each week

        for inventory_id in inventory_ids:
            subquery = f"(SELECT quantity FROM inventory WHERE inventory_id = {inventory_id})"
            report_entries.append(f"    ({inventory_report_id}, {inventory_id}, '{report_date.strftime('%Y-%m-%d')}', {subquery})")

            inventory_report_id += 1

    # write all the entries to the SQL file, separated by commas
    sql_file.write(",\n".join(report_entries) + ";\n")

print("Inventory report SQL file created and written successfully.")
