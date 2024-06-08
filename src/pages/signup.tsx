import React from 'react';
import styles from '../styles/signup.module.css'; // Make sure to create this CSS module

const Register = () => {
    return (
        <div className={styles.registerContainer}>
            <div className={styles.imageSide} style={{ backgroundImage: 'url(/signup.jpg)' }}></div>
            <div className={styles.formSide}>
                <div className={styles.backButton}>
                    <a href="/">
                        Back to Home
                    </a>
                </div>
                <form className={styles.registerForm}>
                    <h2>Shared Platform Info</h2>
                    <label htmlFor="orgName">Organization Name</label>
                    <input type="text" id="orgName" name="orgName" required />

                    {/* <label htmlFor="orgType">Organization Type</label>
                    <select id="orgType" name="orgType" multiple>
                        <option value="type1">Type 1</option>
                        <option value="type2">Type 2</option>
                        <option value="type3">Type 3</option>
                    </select> */}

                    <label htmlFor="username">Organization Code</label>
                    <input type="text" id="username" name="username" required />

                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required />

                    <button type="submit">Sing Up</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
