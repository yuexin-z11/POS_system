/**
 * @description Modal component for managing employee information, including adding, removing, and updating employee details. Displays a table of employee data fetched from the server.
 * @use client
 * @module EmployeeInfoModal
 * @requires React
 * @requires axios
 * @requires UpdateWageModal
 * @requires './EmployeeInfo.module.css'
 * @version 1.0.0
 * @date 2024
 * @license MIT
 * @autor Jane Landrum
 */

"use client";

import React, { useState, useEffect } from 'react';
import UpdateWageModal from './UpdateWageModal';
import axios from 'axios';
import styles from './EmployeeInfo.module.css';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

/**
 * Modal Component for managing employee information.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @returns {JSX.Element} React component for displaying employee data and performing management actions.
 */
const EmployeeInfoModal = ({ onClose }) => {
    const [employeeData, setEmployeeData] = useState([]);
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [employee, setEmployee] = useState({
        employee_name: '',
        email: '',
        phone_number: '',
        job_title: 'Employee',
        wage: '',
        hire_date: new Date().toISOString().split('T')[0], // Set hire date to today's date
    });
    const [employeeIdToRemove, setEmployeeIdToRemove] = useState('');
    const [showRemoveEmployeeModal, setShowRemoveEmployeeModal] = useState(false);
    const [showUpdateEmployeeModal, setShowUpdateEmployeeModal] = useState(false);

    /**
   * Resets the employee form fields to default values.
   */
    const resetEmployeeForm = () => {
        setEmployee({
            employee_name: '',
            email: '',
            phone_number: '',
            job_title: 'Employee',
            wage: '',
            hire_date: new Date().toISOString().split('T')[0], // Reset to today's date
        });
    };

    /**
   * Fetches employee data from the server when the component mounts.
   * 
   * @async
   */
    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const response = await axios.get('/api/employees');
                console.log('Fetched employee data:', response.data);
                setEmployeeData(response.data);
            } catch (error) {
                console.error('Error fetching employee data:', error);
            }
        };

        fetchEmployeeData();
    }, []);

    /**
   * Handles changes to the employee form fields.
   * 
   * @param {Event} e - The input change event.
   */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /**
   * Resets the employee form and closes the Add Employee modal.
   */
    const handleCancel = () => {
        resetEmployeeForm();
        setShowAddEmployeeModal(false);
    };

    /**
   * Adds a new employee by fetching the highest employee ID and incrementing it.
   * 
   * @async
   */
    const handleAddEmployee = async () => {
        try {
            const highestIdResponse = await axios.get('/api/highest-employee-id');
            const { max_id } = highestIdResponse.data;

            const new_id = max_id + 1;

            const newEmployee = {
                employee_id: new_id,
                ...employee,
            };

            const response = await axios.post('/api/add-employee', newEmployee, {
                headers: { 'Content-Type': 'application/json' },
            });

            console.log('Employee added:', response.data);
            resetEmployeeForm();
            setShowAddEmployeeModal(false);
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    };

    /**
   * Removes an employee by ID.
   * 
   * @async
   */
    const handleRemoveEmployee = async () => {
        try {
            await axios.delete(`/api/remove-employee/${employeeIdToRemove}`);
            setShowRemoveEmployeeModal(false);
            setEmployeeIdToRemove('');
            alert('Employee removed successfully!');
        } catch (error) {
            console.error('Error removing employee:', error);
            alert('Error removing employee.');
        }
    };

    /**
   * Opens the Update Wage modal.
   */
    const handleUpdateEmployee = async () => {
        setShowUpdateEmployeeModal(true);
    }

    /**
   * Closes the Update Wage modal.
   */
    const handleCloseWageModal = () => {
        setShowUpdateEmployeeModal(false);
    };

    /**
   * Cancels the Remove Employee operation.
   */
    const handleCancelRemove = () => {
        setShowRemoveEmployeeModal(false);
        setEmployeeIdToRemove('');
    };

    return (
        <div className={styles.modalWrapper}>
            <div className={styles.modal}>
                <div className={styles.modalContent}>
                    {/* Modal Header */}
                    <div className={styles.modalHeader}>
                        <h2>Employee Information</h2>
                    </div>

                    {/* Table with Employee Data */}
                    <table className={styles.employeeTable}>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                                <th>Job Title</th>
                                <th>Wage</th>
                                <th>Hire Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeData.map((employee) => (
                                <tr key={employee.employee_id}>
                                    <td>{employee.employee_id}</td>
                                    <td>{employee.employee_name}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.phone_number}</td>
                                    <td>{employee.job_title}</td>
                                    <td>{employee.wage}</td>
                                    <td>{new Date(employee.hire_date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Modal Footer with Buttons */}
                    <div className={styles.modalFooter}>
                        <div className={styles.buttonGroup}>
                            <button onClick={() => setShowAddEmployeeModal(true)}>Add Employee</button>
                            <button onClick={() => setShowRemoveEmployeeModal(true)}>Remove Employee</button>
                            <button onClick={() => setShowUpdateEmployeeModal(true)}>Update Employee Wage</button>
                            <button onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Employee Modal */}
            {showAddEmployeeModal && (
                <div className={styles.addEmployeeModal}>
                    <div className={styles.modalContent}>
                        <h2>Add New Employee</h2>
                        <form>
                            <div className={styles.formGroup}>
                                <label>Employee Name</label>
                                <input
                                    type="text"
                                    name="employee_name"
                                    value={employee.employee_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={employee.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone Number - format: XXX-XXX-XXXX</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={employee.phone_number}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Job Title</label>
                                <select
                                    name="job_title"
                                    value={employee.job_title}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Wage (hourly)</label>
                                <input
                                    type="number"
                                    name="wage"
                                    value={employee.wage}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Hire Date</label>
                                <input
                                    type="date"
                                    name="hire_date"
                                    value={employee.hire_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </form>
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={handleCancel}>Cancel</button>
                            <button className={styles.btnConfirm} onClick={handleAddEmployee}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Employee Modal */}
            {showRemoveEmployeeModal && (
                <div className={styles.addEmployeeModal}>
                    <div className={styles.modalContent}>
                        <h2>Remove Employee</h2>
                        <div className={styles.formGroup}>
                            <label>Enter Employee ID to Remove</label>
                            <input
                                type="text"
                                name="employeeIdToRemove"
                                value={employeeIdToRemove}
                                onChange={(e) => setEmployeeIdToRemove(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={handleCancelRemove}>Cancel</button>
                            <button className={styles.btnConfirm} onClick={handleRemoveEmployee}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Employee Modal */}
            {showUpdateEmployeeModal && (
            <UpdateWageModal
                isOpen={showUpdateEmployeeModal} // Control modal visibility
                onClose={handleCloseWageModal}
            />
            )}
        </div>
    );
};

export default EmployeeInfoModal;
