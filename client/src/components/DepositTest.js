import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const DepositTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testDepositFunctionality = async () => {
    setLoading(true);
    setTestResult('Testing deposit functionality...\n');
    
    try {
      // Test 1: Check if user is authenticated
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        setTestResult(prev => prev + '❌ User not authenticated\n');
        return;
      }
      
      setTestResult(prev => prev + '✓ User authenticated\n');
      
      // Test 2: Fetch deposit history
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/deposit/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTestResult(prev => prev + `✓ Deposit history fetched successfully. Found ${response.data.length} deposits\n`);
        
        // Test 3: Check if userData is properly structured
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) {
          setTestResult(prev => prev + `✓ User data found in localStorage\n`);
          setTestResult(prev => prev + `  Balance: ${savedUser.balance || 0}\n`);
          setTestResult(prev => prev + `  Total Amount: ${savedUser.total_amount || 'Not found'}\n`);
          setTestResult(prev => prev + `  Quantify: ${savedUser.quantify || 0}\n`);
        }
        
      } catch (error) {
        setTestResult(prev => prev + `❌ Error fetching deposit history: ${error.message}\n`);
        if (error.response) {
          setTestResult(prev => prev + `  Status: ${error.response.status}\n`);
          setTestResult(prev => prev + `  Data: ${JSON.stringify(error.response.data)}\n`);
        }
      }
      
    } catch (error) {
      setTestResult(prev => prev + `❌ General error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1f2e', color: 'white', fontFamily: 'monospace' }}>
      <h2>Deposit Functionality Test</h2>
      <button 
        onClick={testDepositFunctionality}
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#49bace', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Run Test'}
      </button>
      
      <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap', backgroundColor: '#2d3748', padding: '15px', borderRadius: '5px' }}>
        {testResult || 'Click "Run Test" to check deposit functionality'}
      </div>
    </div>
  );
};

export default DepositTest;