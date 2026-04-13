import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BASE_URL } from '../config';

function VerifyEmail() {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        
        const verify = async () => {
            hasFetched.current = true;
            try {
                const response = await fetch(`${BASE_URL}/api/auth/verify-email/${token}`);
                const data = await response.json();
                
                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Email verified successfully!');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Network error. Please try again later.');
            }
        };

        if (token) {
            verify();
        }
    }, [token]);

    return (
        <div className="login-container">
            <div className="login-card" style={{ textAlign: 'center' }}>
                <div className="login-header">
                    <h1>Email Verification</h1>
                </div>
                
                {status === 'verifying' && (
                    <div className="empty-state">
                        <p>Verifying your email please wait...</p>
                    </div>
                )}
                
                {status === 'success' && (
                    <div className="form-group">
                        <div style={{ color: '#16a34a', fontSize: '1.2rem', marginBottom: '1rem' }}>
                            ✅ {message}
                        </div>
                        <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            Go to Login
                        </Link>
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="form-group">
                        <div style={{ color: '#dc2626', fontSize: '1.2rem', marginBottom: '1rem' }}>
                            ❌ {message}
                        </div>
                        <Link to="/register" className="btn-primary full-width" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
                            Back to Register
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
