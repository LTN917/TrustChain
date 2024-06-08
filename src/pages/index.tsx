import React from 'react';
import Navbar from './components/Navbar'; // Update the import path as necessary
import styles from '../styles/homepage.module.css';

const Home = () => {
    const isAuthenticated = false; // This should be derived from your auth logic
    const userName = 'John Doe'; // This should be derived from your auth logic

    return (
        <>
            <Navbar isAuthenticated={isAuthenticated} userName={userName} />
            <div className={styles.background}></div>
            <div className={styles.main}>
                <h1 className={styles.fadeInElement}>Welcome to TrustChain</h1>
                <p className={styles.fadeInElement}>Explore our blockchain-driven system, designed for the secure and traceable in your shared platforms</p>
                <button className={styles.button}>
                    <a href="/learn-more">Learn More</a>
                </button>
                <button className={styles.button}>
                    <a href="/signup">Sign up</a>
                </button>
            </div>
        </>
    );
};

export default Home;
