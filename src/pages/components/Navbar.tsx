import React from 'react';
import styles from '../../styles/navbar.module.css'; // Ensure you create/update this CSS module

type NavbarProps = {
    isAuthenticated: boolean;
    userName?: string;
};

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, userName }) => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <ul className={styles.navItems}>
                    <li><a href="#about">About</a></li>
                    <li><a href="#doc">Doc</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </div>
            <div className={styles.authSection}>
                {isAuthenticated ? (
                    <span>Welcome, {userName}</span>
                ) : (
                    <a href="/signin">Sign In</a>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
