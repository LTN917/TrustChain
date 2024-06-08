import React from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar'; // Update the import path as necessary

const Home = () => {
    const router = useRouter();
    const { org_code_name } = router.query;  // 从 URL 获取 username
    const isAuthenticated = true; // This should be derived from your auth logic

    return (
        <>
            <Navbar isAuthenticated={isAuthenticated} userName={org_code_name as string} />
            <h1>Dashboard</h1>
            {/* <div className={styles.background}></div>
            <div className={styles.main}>
                <h1 className={styles.fadeInElement}>Welcome to TrustChain</h1>
                <p className={styles.fadeInElement}>Explore our blockchain-driven system, designed for the secure and traceable in your shared platforms</p>
                <button className={styles.button}>
                    <a href="/learn-more">Learn More</a>
                </button>
                <button className={styles.button}>
                    <a href="/signup">Sign up</a>
                </button>
            </div> */}
        </>
    );
};

export default Home;