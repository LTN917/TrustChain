import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import styles from '../../../styles/dashboard.module.css';

const Dashboard = () => {
    const router = useRouter();
    const { org_code_name } = router.query;
    const isAuthenticated = true;
    const [activeTab, setActiveTab] = useState('upto_blockchain');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <>
            <Navbar isAuthenticated={isAuthenticated} userName={org_code_name as string} />
            <div className={styles.dashboard}>
                <h1 className={styles.dashboardTitle}>Dashboard</h1>
                <div className={styles.tabContainer}>
                    <button className={`${styles.tabButton} ${activeTab === 'upto_blockchain' ? styles.active : ''}`}
                            onClick={() => handleTabChange('upto_blockchain')}>
                        Data Up to Blockchain
                    </button>
                    <button className={`${styles.tabButton} ${activeTab === 'verify_rp' ? styles.active : ''}`}
                            onClick={() => handleTabChange('verify_rp')}>
                        Verify RP on Blockchain
                    </button>
                </div>
                <div className={styles.content}>
                    {activeTab === 'upto_blockchain' && (
                        <div className={styles.form}>
                            <label htmlFor="jsonData">Authorization Data Entry JSON</label>
                            <textarea id="jsonData" placeholder="Enter Authorization Data JSON" className={styles.textarea}></textarea>
                            <label htmlFor="fileUpload" className={styles.fileUploadLabel}>Upload Authdata File</label>
                            <input id="fileUpload" type="file" className={styles.fileUploadInput}/>
                            <button className={styles.actionButton}>Send to Blockchain</button>
                        </div>
                    )}
                    {activeTab === 'verify_rp' && (
                        <div className={styles.form}>
                            <label htmlFor="jsonData">Request Party Info JSON</label>
                            <textarea id="jsonData" placeholder="Enter Authorization Data JSON" className={styles.textarea}></textarea>
                            <label htmlFor="fileUpload" className={styles.fileUploadLabel}>Upload RP Info File</label>
                            <input id="fileUpload" type="file" className={styles.fileUploadInput}/>
                            <button className={styles.actionButton}>Verify RP</button>                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;