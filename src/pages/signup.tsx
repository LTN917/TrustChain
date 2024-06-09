import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/signup.module.css';

interface FormData {
    organizationName: string;
    organizationCode: string;
    password: string;
}

interface Message {
    type: 'success' | 'error';
    content: string;
}

const Signup: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        organizationName: '',
        organizationCode: '',
        password: ''
    });
    const [message, setMessage] = useState<Message | null>(null);
    const router = useRouter();
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/member/signup', formData);
            setMessage({ type: 'success', content: 'Registration successful! Redirecting to home...' });
            const id = setTimeout(() => {
                router.push('/');
            }, 3000); // Redirect after 3 seconds
            setTimeoutId(id); // Store the timeout ID for potential cleanup
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', content: 'Failed to register: ' + (error.response?.data.message || error.message) });
        }
    };

    useEffect(() => {
        return () => {
            if (timeoutId) clearTimeout(timeoutId); // Clear the timeout if it exists
        };
    }, [timeoutId]); // Ensure cleanup runs if timeoutId changes

    return (
        <div className={styles.registerContainer}>
            <div className={styles.imageSide} style={{ backgroundImage: 'url(/signup.jpg)' }}></div>
            <div className={styles.formSide}>
                <div className={styles.backButton}>
                    <Link href="/">Back to Home</Link>
                </div>
                <form className={styles.registerForm} onSubmit={handleSubmit}>
                    <h2>Sign Up</h2>
                    {message && (
                        <p className={`${styles.message} ${message.type === 'error' ? styles.errorMessage : styles.successMessage}`}>
                            {message.content}
                        </p>
                    )}
                    <label htmlFor="organizationName">Organization Name</label>
                    <input type="text" id="organizationName" name="organizationName" required onChange={handleChange} />

                    <label htmlFor="organizationCode">Organization Code</label>
                    <input type="text" id="organizationCode" name="organizationCode" required onChange={handleChange} />

                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required onChange={handleChange} />

                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
