/**
 * Updates the wage for an employee
 * 
 * @author Jane Landrum
 
 * @description Updates the wage for an employee

 */
import React, { useState } from 'react';
import './UpdateWageModal.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';

/**
 * UpdateWageModal component for updating an employee's wage.

 */
const UpdateWageModal = ({ isOpen, onClose, onUpdate }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [newWage, setNewWage] = useState('');
    /**
     * Handles submission of wage update.
     * 
     * Validates input, sends a POST request to update wage,
     * and closes the modal on successful update.
     * 
     * @throws {Error} If there's an issue with the API request
     */
    const handleSubmit = async () => {
        // Validate input fields
        if (!employeeId || !newWage) {
            alert('Please fill in both fields');
            return;
        }
        try {
            // Send wage update request
            const response = await axios.post('/api/set-wage', {
                id: employeeId,
                wage: newWage,
            });

            if (response.status === 200) {
                onClose();
            } else {
                alert(response.data.message || 'Error updating wage');
            }
        } catch (error) {
            console.error('Error updating wage:', error);
            alert('Error updating wage');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Update Employee Wage</h2>
                <div className="form-group">
                    <label>Employee ID</label>
                    <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>New Wage</label>
                    <input
                        type="number"
                        value={newWage}
                        onChange={(e) => setNewWage(e.target.value)}
                    />
                </div>
                <div className="modal-actions">
                    <button onClick={handleSubmit}>Confirm</button>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default UpdateWageModal;
