import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import styles from '../../../styles/dashboard.module.css';
import axios from 'axios';

const Dashboard = () => {
    const router = useRouter();
    const { org_code_name } = router.query;
    const isAuthenticated = true;
    const [activeTab, setActiveTab] = useState('upto_blockchain');
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [jsonData, setJsonData] = useState('');
    const [jsonStatus, setJsonStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [operationLogs, setOperationLogs] = useState([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        ws.onmessage = (event) => {
            console.log("Received data:", event.data);
            const log = JSON.parse(event.data);
            setOperationLogs((prevLogs) => [...prevLogs, log]);
        };
    
        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };
    
        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };
    
        return () => {
            ws.close();
        };
    }, []);
    

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/json') {
            setFile(file);
            setUploadStatus('success');
        } else {
            setUploadStatus('error');
        }
    };

    const handleJsonChange = (e) => {
        const text = e.target.value;
        setJsonData(text);
        try {
            JSON.parse(text);
            setJsonStatus('success');
        } catch (error) {
            setJsonStatus('error');
        }
    };

    const handleSubmit = async (apiUrl: string) => {
        if (!file || uploadStatus !== 'success') {
            alert('Please upload a valid JSON file.');
            return;
        }
    
        setIsSubmitting(true);
        setOperationLogs(prevLogs => [...prevLogs, 'Starting upload...']);
    
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target.result as string);
                const response = await axios.post(apiUrl, json, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                setOperationLogs(prevLogs => [
                    ...prevLogs,
                    { message: 'API call successful: ' + response.data.message, status: 'success' }
                ]);
                alert('API call successful: ' + response.data.message);
            } catch (error) {
                setOperationLogs(prevLogs => [
                    ...prevLogs,
                    { message: 'API call failed: ' + error.message, status: 'error' }
                ]);
                alert('API call failed: ' + error.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file); // ensure you read the file as text
    
        setIsSubmitting(false);
    };
    
    

    const getFeedbackMessage = (type) => {
        if (type === 'file') {
            return uploadStatus === 'success' ? <p className={styles.successMessage}>File uploaded successfully ✅</p> :
                   uploadStatus === 'error' ? <p className={styles.errorMessage}>Invalid file type. Please upload a JSON file ❌</p> : null;
        } else if (type === 'json') {
            return jsonStatus === 'success' ? <p className={styles.successMessage}>Valid JSON ✅</p> :
                   jsonStatus === 'error' ? <p className={styles.errorMessage}>Invalid JSON format ❌</p> : null;
        }
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
                            <textarea id="jsonData" value={jsonData} onChange={handleJsonChange} placeholder="Enter Authorization Data JSON" className={styles.textarea}></textarea>
                            {getFeedbackMessage('json')}
                            <label htmlFor="fileUpload" className={styles.fileUploadLabel}>Upload Authdata File</label>
                            <input id="fileUpload" type="file" className={styles.fileUploadInput} onChange={handleFileChange}/>
                            {getFeedbackMessage('file')}
                            <button className={styles.actionButton} onClick={() => handleSubmit('http://localhost:3000/api/MQ/system_connection')} disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : 'Send to Blockchain'}
                            </button>
                        </div>
                    )}
                    {activeTab === 'verify_rp' && (
                        <div className={styles.form}>
                            <label htmlFor="jsonData">Request Party Info JSON</label>
                            <textarea id="jsonData" value={jsonData} onChange={handleJsonChange} placeholder="Enter Request Party Info JSON" className={styles.textarea}></textarea>
                            {getFeedbackMessage('json')}
                            <label htmlFor="fileUpload" className={styles.fileUploadLabel}>Upload RP Info File</label>
                            <input id="fileUpload" type="file" className={styles.fileUploadInput} onChange={handleFileChange}/>
                            {getFeedbackMessage('file')}
                            <button className={styles.actionButton} onClick={() => handleSubmit('http://localhost:3000/api/MQ/rpdata_connection')} disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : 'Verify RP'}
                            </button>
                        </div>
                    )}
                        <div className={styles.logContainer}>
                            {operationLogs.map((log, index) => (
                                <div key={index} className={styles.logEntry}>
                                    <span className={styles.logDetail}><strong>Data ID:</strong> {log.data_id}</span>
                                    <span className={styles.logDetail}><strong>Time:</strong> {log.timestamp}</span>
                                    <span className={styles.logDetail}><strong>Status:</strong> {log.status === 'error' ? '❌ Error' : '✅ Success'}</span>
                                </div>
                            ))}
                        </div>                    
                    </div>
            </div>
        </>
    );
};

export default Dashboard;
