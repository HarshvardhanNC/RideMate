import { useState } from 'react';
import apiService from '../services/api';

const ApiTest = () => {
    const [status, setStatus] = useState('Not tested');
    const [response, setResponse] = useState(null);

    const testApiConnection = async () => {
        try {
            setStatus('Testing...');
            const result = await apiService.healthCheck();
            setStatus('Success');
            setResponse(result);
        } catch (error) {
            setStatus('Failed');
            setResponse(error.message);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold mb-2">API Connection Test</h3>
            <button 
                onClick={testApiConnection}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Test API Connection
            </button>
            <div className="mt-2">
                <p><strong>Status:</strong> {status}</p>
                <p><strong>Response:</strong> {JSON.stringify(response, null, 2)}</p>
            </div>
        </div>
    );
};

export default ApiTest;
