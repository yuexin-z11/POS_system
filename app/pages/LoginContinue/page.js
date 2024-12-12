/**
 * LoginContinue Component
 * 
 * This component is responsible for handling the continuation of the login process after 
 * the user has authenticated. It retrieves the user session using NextAuth's `getSession` 
 * function and redirects the user to the appropriate page based on their job title 
 * (e.g., Cashier for employees, Manager for managers). It also saves the user details 
 * in the local storage.
 * 
 * @author Jane Landrum
 * Date: December 2024
 * 
 * @component
 */
'use client';

import { useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * LoginContinue Component
 * 
 * Handles the login continuation by checking the session data, storing user 
 * information in local storage, and redirecting based on the user's role.
 */

const LoginContinue = () => {
    const router = useRouter();

    /**
     * Saves the user details in local storage.
     * 
     * @param {Object} user The user object containing user details.
     * @returns {void}
     */
    const setUserInLocalStorage = (user) => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user'); // Clear user on failure
        }
    };

    /**
     * Handles the continue action after checking the session data.
     * 
     * Retrieves the user session, saves user details to local storage, 
     * and redirects the user to the appropriate page based on their job title.
     * 
     * @async
     * @returns {void}
     */
    const handleContinue = async () => {
        try {
            const session = await getSession();
            console.log('Session:', session);

            if (session?.user) {
                console.log('Session user:', session.user);

                // Set user details in localStorage
                const user = {
                    googleId: session.user.googleId,
                    employeeId: session.user.id,
                    name: session.user.name,
                    jobTitle: session.user.jobTitle,
                };
                setUserInLocalStorage(user);

                // Redirect based on job title
                if (user.jobTitle === 'Employee') {
                    router.push('/pages/cashier');
                } else if (user.jobTitle === 'Manager') {
                    router.push('/pages/manager');
                } else {
                    console.error('Unexpected job title:', user.jobTitle);
                    alert('Unexpected user type. Please contact support.');
                }
            } else {
                alert('Failed to retrieve session data.');
            }
        } catch (err) {
            console.error('Error during continue process:', err);
            alert('Failed to continue login process.');
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: 'maroon',
            }}
        >
            <button
                onClick={handleContinue}
                style={{
                    padding: '1em 2em',
                    fontSize: '1.5rem',
                    color: 'maroon',
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Continue
            </button>
        </div>
    );
};

export default LoginContinue;
