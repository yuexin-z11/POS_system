/**
 * LoginPage Component
 * 
 * This component represents the login page where users can log in with their Google 
 * account or access the Kiosk view. If the user's account is unlinked, a modal will 
 * prompt them to link their Google account to an existing employee profile.
 * 
 * @author Jane Landrum
 * Date: December 2024
 * 
 * @component
 */
"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { signIn } from 'next-auth/react';
import LinkAccountModal from './LinkAccountModal';
import {getSession} from 'next-auth/react';

axios.defaults.baseURL = 'https://project-3-52-urmother.onrender.com';
//axios.defaults.baseURL = 'http://localhost:5000';


/**
 * LoginPage Component
 * 
 * Renders the login page where users can sign in using their Google account or 
 * access the kiosk view. If the account is unlinked, a modal will be displayed 
 * to link the Google account with an employee profile.
 * 
 * @component
 */
const LoginPage = () => {
    const [error, setError] = useState('');
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [googleId, setGoogleId] = useState(''); // To store Google account ID
    const router = useRouter();

    /**
     * Effect hook to check if the URL has an error query parameter 
     * and show the link modal if the account is unlinked.
     * 
     * @useEffect
     * @returns {void}
     */
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const errorParam = queryParams.get('error');

        if (errorParam === 'UNLINKED_ACCOUNT') {
            setShowLinkModal(true);
            const googleId = queryParams.get('googleId');
            setGoogleId(googleId); // Set Google ID from the URL
        }
    }, []); // Run only once when component mounts

    /**
     * Handles the Google login process using NextAuth.
     * If login is successful, redirects the user to the LoginContinue page.
     * If an error occurs, displays the appropriate error message.
     * 
     * @async
     * @returns {void}
     */
    const handleGoogleLogin = async () => {
        const session = await getSession();
        try {
            // Attempt to sign in using Google OAuth
            const result = await signIn('google', { redirect: true, callbackUrl: '/pages/LoginContinue' });
            
            // Check for errors and handle them
            if (result?.error) {
                if (result.error === 'UNLINKED_ACCOUNT') {
                    setShowLinkModal(true); // Show modal if account is unlinked
                } else {
                    setError(result.error);
                }
            } else {
                // Redirect to LoginContinue page after successful login
                router.push('/pages/LoginContinue');
            }
        } catch (err) {
            console.error('Google login failed:', err);
            setError('Failed to log in with Google.');
            alert('Failed to log in with Google.');
        }
    };

    /**
     * Navigates the user to the kiosk view page.
     * 
     * @returns {void}
     */
    const handleKioskView = () => {
        router.push('/pages/kiosk');
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Login</h1>
            {error && <p className={styles.error}>{error}</p>}
                <button type="button" onClick={handleGoogleLogin} className={styles.button}>Login with Google</button>
                <button type="button" onClick={handleKioskView} className={styles.kioskButton}>Kiosk View</button>
            {showLinkModal && (
                <LinkAccountModal
                googleId={googleId}
                onClose={() => {
                    setShowLinkModal(false);
                    router.push("/pages/login");
                }}
                onLink={() => {
                    setShowLinkModal(false);
                    router.push("/pages/login");
                }}
            />
        )}
        </div>
    );
};

export default LoginPage;