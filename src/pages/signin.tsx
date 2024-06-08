import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/signin.module.css'; // 確保已創建相應的 CSS 模組

const SignIn = () => {
    const [organizationName, setOrganizationName] = useState('');
    const [organizationCode, setOrganizationCode] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/member/signin', {
                organizationName,
                organizationCode,
                password
            });
            setMessage('Login successful! Redirecting...');
            setTimeout(() => {
                router.push(`/dashboard/${organizationCode}-${organizationName}`); // 假設 '/dashboard' 是用戶儀表板的路徑
            }, 3000);
        } catch (error: any) {
            setMessage('Login failed: ' + (error.response?.data.message || error.message));
        }
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.imageSide} style={{ backgroundImage: 'url(/signin.jpg)' }}></div>
            <div className={styles.formSide}>
                <div className={styles.backButton}>
                    <a href="/">
                        Back to Home
                    </a>
                </div>
                <form className={styles.registerForm} onSubmit={handleSubmit}>
                    <h2>Input Info</h2>
                    <label htmlFor="organizationName">Organization Name</label>
                    <input type="text" id="organizationName" name="organizationName" required
                        value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />

                    <label htmlFor="organizationCode">Organization Code</label>
                    <input type="text" id="organizationCode" name="organizationCode" required
                        value={organizationCode} onChange={(e) => setOrganizationCode(e.target.value)} />

                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required
                        value={password} onChange={(e) => setPassword(e.target.value)} />

                    <button type="submit">Sign In</button>
                    {message && <div>{message}</div>}
                </form>
            </div>
        </div>
    );
};

export default SignIn;
