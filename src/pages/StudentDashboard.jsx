import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { CheckCircle, XCircle, Camera, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function StudentDashboard() {
    const { user, logout } = useAuth()
    const [scanResult, setScanResult] = useState(null)
    const [isScanning, setIsScanning] = useState(false)
    const [message, setMessage] = useState(null)
    const [status, setStatus] = useState(null) // 'success' or 'error'
    const scannerRef = useRef(null)

    useEffect(() => {
        if (isScanning && !scannerRef.current) {
            // Initialize scanner
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            )

            scannerRef.current = scanner

            scanner.render(onScanSuccess, onScanFailure)
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err))
                scannerRef.current = null
            }
        }
    }, [isScanning])

    const onScanSuccess = async (decodedText, decodedResult) => {
        console.log(`Scan result: ${decodedText}`, decodedResult)

        // Stop scanning immediately
        if (scannerRef.current) {
            await scannerRef.current.clear()
            scannerRef.current = null
        }
        setIsScanning(false)
        setScanResult(decodedText)

        // Submit attendance
        markAttendance(decodedText)
    }

    const onScanFailure = (error) => {
        // console.warn(`Code scan error = ${error}`)
    }

    const markAttendance = async (token) => {
        setMessage('Processing attendance...')
        setStatus('loading')

        try {
            const authToken = localStorage.getItem('token')
            const response = await fetch('http://localhost:5000/api/attendance/mark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ token })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to mark attendance')
            }

            setStatus('success')
            setMessage(data.message || 'Attendance marked successfully!')
        } catch (err) {
            console.error('Attendance error:', err)
            setStatus('error')
            setMessage(err.message || 'Failed to mark attendance. Please try again.')
        }
    }

    const startScanning = () => {
        setMessage(null)
        setStatus(null)
        setIsScanning(true)
    }

    const stopScanning = async () => {
        if (scannerRef.current) {
            await scannerRef.current.clear()
            scannerRef.current = null
        }
        setIsScanning(false)
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div className="card">
                <div className="card-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 className="card-title">Student Dashboard</h2>
                            <p className="card-description">Welcome, {user?.name}</p>
                        </div>
                        <button onClick={logout} className="btn-outline" style={{ padding: '8px' }}>
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '20px', textAlign: 'center' }}>
                    {!isScanning && status !== 'success' && (
                        <button className="btn-primary" onClick={startScanning} style={{ width: '100%', padding: '15px' }}>
                            <Camera size={24} style={{ marginRight: '10px' }} />
                            Scan QR Code
                        </button>
                    )}

                    {isScanning && (
                        <div>
                            <div id="reader" style={{ width: '100%' }}></div>
                            <button className="btn-outline" onClick={stopScanning} style={{ marginTop: '20px' }}>
                                Cancel Scanning
                            </button>
                        </div>
                    )}

                    {message && (
                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            borderRadius: '8px',
                            backgroundColor: status === 'success' ? '#dcfce7' : status === 'error' ? '#fee2e2' : '#f3f4f6',
                            color: status === 'success' ? '#166534' : status === 'error' ? '#991b1b' : '#374151',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            {status === 'success' && <CheckCircle size={48} />}
                            {status === 'error' && <XCircle size={48} />}
                            <p style={{ fontWeight: '500' }}>{message}</p>

                            {status === 'success' && (
                                <button className="btn-primary" onClick={() => { setStatus(null); setMessage(null); }} style={{ marginTop: '10px' }}>
                                    Scan Another
                                </button>
                            )}
                            {status === 'error' && (
                                <button className="btn-primary" onClick={startScanning} style={{ marginTop: '10px' }}>
                                    Try Again
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StudentDashboard
