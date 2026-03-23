import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#1e2230',
                            color: '#e8eaf0',
                            border: '1px solid #2e3448',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                        },
                        success: { iconTheme: { primary: '#22c55e', secondary: '#1e2230' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#1e2230' } },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
