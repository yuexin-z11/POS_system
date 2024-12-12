CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone_number VARCHAR(100),
    job_title VARCHAR(100),
    wage FLOAT,
    hire_date DATE
);

INSERT INTO employees (employee_id, name, email, phone_number, job_title, wage, hire_date) VALUES 
    (1, 'Michelle Ochoa', 'michelleochoa@example.com', '572-864-0979', 'Employee', 511.25, '2016-05-28'),
    (2, 'Marisa King', 'marisaking@example.com', '834-132-8911', 'Employee', 178.39, '2021-06-28'),
    (3, 'Joshua Lawrence', 'joshualawrence@example.com', '406-239-0821', 'Employee', 651.33, '2021-11-09'),
    (4, 'Nathaniel Perez', 'nathanielperez@example.com', '394-774-7888', 'Employee', 407.18, '2017-11-25'),
    (5, 'Kristen Hughes', 'kristenhughes@example.com', '276-305-8280', 'Employee', 548.85, '2016-07-09'),
    (6, 'Cody Carter', 'codycarter@example.com', '928-338-6761', 'Employee', 504.52, '2022-03-05'),
    (7, 'Trevor Smith', 'trevorsmith@example.com', '591-129-6587', 'Employee', 182.91, '2017-02-23'),
    (8, 'Mario Mercado', 'mariomercado@example.com', '610-772-3928', 'Employee', 821.59, '2019-03-19'),
    (9, 'Cynthia Larson', 'cynthialarson@example.com', '356-080-8464', 'Employee', 757.59, '2020-04-11'),
    (10, 'Anthony Conner', 'anthonyconner@example.com', '583-611-7505', 'Employee', 979.63, '2017-02-21'),
    (11, 'Anna Davidson', 'annadavidson@example.com', '755-533-2734', 'Employee', 852.62, '2020-02-26'),
    (12, 'Brittany Warner', 'brittanywarner@example.com', '245-285-6639', 'Employee', 394.4, '2017-02-14'),
    (13, 'Courtney Hamilton', 'courtneyhamilton@example.com', '431-986-5074', 'Employee', 642.68, '2015-02-28'),
    (14, 'Brian Miller', 'brianmiller@example.com', '760-471-4008', 'Employee', 400.25, '2015-09-15'),
    (15, 'Anthony Anderson', 'anthonyanderson@example.com', '842-939-5462', 'Employee', 595.21, '2019-06-08');
