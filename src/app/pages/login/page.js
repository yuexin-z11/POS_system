"use client"; // Ensure this file can use client-side features

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import styles from './login.module.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`Received email: ${email}, employee_id: ${customerId}`);

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, employee_id: customerId }),
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data.user)); // Store user info in local storage
            console.log('User logged in successfully:', data.user);
            router.push('/pages/cashier'); // Redirect to cashier page
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred.');
        }
    };

    const handleKioskView = () => {
        router.push('/pages/kiosk'); // Adjust this path if necessary
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Login</h1>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Customer ID</label>
                    <input
                        type="text"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <button type="submit" className={styles.button}>
                    Login
                </button>
                <button type="button" onClick={handleKioskView} className={styles.kioskButton}>
                    Kiosk View
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
