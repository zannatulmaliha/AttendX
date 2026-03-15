import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { CheckCircle, XCircle, Camera, LogOut, BookOpen, Clock, Calendar, CheckSquare, Zap, Target, Award, Play } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { BASE_URL } from '../config'

function StudentDashboard() {
    const { user, logout } = useAuth()
    const [scanResult, setScanResult] = useState(null)
    const [isScanning, setIsScanning] = useState(false)
    const [message, setMessage] = useState(null)
    const [status, setStatus] = useState(null) // 'success' or 'error'
    const scannerRef = useRef(null)

    // New state for stats
    const [stats, setStats] = useState({
        attendancePercentage: 0,
        currentStreak: 0,
        thisWeek: 0,
        totalAttended: 0,
        totalRequired: 25,
        recentRecords: []
    })
    const [loadingStats, setLoadingStats] = useState(true)

    const fetchStats = async () => {
        try {
            setLoadingStats(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${BASE_URL}/api/attendance/student/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
            setLoadingStats(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

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
            const response = await fetch(`${BASE_URL}/api/attendance/mark`, {
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
            
            // Refresh stats after successful scan
            fetchStats()
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

    // Helper to format date
    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', year: 'numeric' }
        return new Date(dateString).toLocaleDateString('en-US', options)
    }

    // Helper to format time
    const formatTime = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit' }
        return new Date(dateString).toLocaleTimeString('en-US', options)
    }

    // Simple temporary icon for user profile
    const UserIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    )

    return (
        <div className="student-dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="user-profile">
                    <div className="avatar">
                        <UserIcon />
                    </div>
                    <div className="user-info">
                        <h2>Student Portal</h2>
                        <p>{user?.email || 'student@demo.com'}</p>
                    </div>
                </div>
                <button onClick={logout} className="logout-btn-styled">
                    <LogOut size={16} />
                    Logout
                </button>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card green">
                    <div className="stat-header">
                        <span>Attendance</span>
                        <Target size={18} />
                    </div>
                    <div>
                        <div className="stat-value">{stats.attendancePercentage}%</div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${stats.attendancePercentage}%` }}></div>
                        </div>
                    </div>
                </div>
                
                <div className="stat-card red">
                    <div className="stat-header">
                        <span>Current Streak</span>
                        <Zap size={18} />
                    </div>
                    <div>
                        <div className="stat-value">{stats.currentStreak}</div>
                        <div className="stat-subtitle">Keep it up! 🔥</div>
                    </div>
                </div>
                
                <div className="stat-card purple">
                    <div className="stat-header">
                        <span>This Week</span>
                        <Calendar size={18} />
                    </div>
                    <div>
                        <div className="stat-value">{stats.thisWeek}</div>
                        <div className="stat-subtitle">Classes attended</div>
                    </div>
                </div>
                
                <div className="stat-card pink">
                    <div className="stat-header">
                        <span>Total Classes</span>
                        <Award size={18} />
                    </div>
                    <div>
                        <div className="stat-value">{stats.totalAttended}</div>
                        <div className="stat-subtitle">Out of {stats.totalRequired}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Scanner Panel */}
                <div className="panel-card">
                    <div className="panel-header">
                        <Camera size={20} />
                        <h3>QR Code Scanner</h3>
                    </div>
                    <p className="panel-subtitle">Position the QR code within the frame to mark attendance</p>

                    <div className="scanner-container">
                        {!isScanning && status !== 'success' && status !== 'error' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Camera size={48} opacity={0.5} style={{ marginBottom: '1rem' }} />
                                <div style={{ fontWeight: '500' }}>Ready to scan</div>
                                <div style={{ fontSize: '0.875rem' }}>Camera preview will appear here</div>
                            </div>
                        )}

                        {isScanning && (
                            <div id="reader" style={{ width: '100%', border: 'none' }}></div>
                        )}

                        {status && (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                {status === 'success' && <CheckCircle size={48} color="#166534" style={{ margin: '0 auto' }} />}
                                {status === 'error' && <XCircle size={48} color="#991b1b" style={{ margin: '0 auto' }} />}
                                <p style={{ fontWeight: '500', color: status === 'success' ? '#166534' : '#991b1b', marginTop: '1rem' }}>{message}</p>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {!isScanning && status !== 'success' && (
                            <button className="scanner-btn" onClick={startScanning} style={{ margin: '1.5rem auto 0' }}>
                                <Camera size={16} />
                                Start Scanning
                            </button>
                        )}
                        
                        {isScanning && (
                            <button className="scanner-btn" onClick={stopScanning} style={{ margin: '1.5rem auto 0' }}>
                                Stop Scanning
                            </button>
                        )}

                        {status === 'success' && (
                            <button className="scanner-btn" onClick={() => { setStatus(null); setMessage(null); startScanning(); }} style={{ margin: '1.5rem auto 0' }}>
                                Scan Another
                            </button>
                        )}
                        
                        {status === 'error' && (
                            <button className="scanner-btn" onClick={() => { setStatus(null); setMessage(null); startScanning(); }} style={{ margin: '1.5rem auto 0' }}>
                                Try Again
                            </button>
                        )}
                    </div>

                    <div className="scanner-tip">
                        <Play size={16} style={{ marginTop: '2px', color: '#1e40af' }} />
                        <div>
                            <h4>Quick Tip:</h4>
                            <p>Hold your device steady and ensure good lighting for faster scanning.</p>
                        </div>
                    </div>
                </div>

                {/* Recent Attendance List Panel */}
                <div className="panel-card">
                    <div className="panel-header">
                        <Clock size={20} />
                        <h3>Recent Attendance</h3>
                    </div>
                    <p className="panel-subtitle">Your latest attendance records</p>

                    <div className="attendance-list">
                        {loadingStats ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading records...</div>
                        ) : stats.recentRecords.length > 0 ? (
                            stats.recentRecords.map((record) => (
                                <div key={record._id || Math.random()} className="attendance-item">
                                    <div className="class-info">
                                        <h4>{record.classId?.code} - {record.classId?.name || 'Class Attendance'}</h4>
                                        <div className="class-meta">
                                            <span className="meta-item">
                                                <Calendar size={14} />
                                                {formatDate(record.date)}
                                            </span>
                                            <span className="meta-item">
                                                <Clock size={14} />
                                                {formatTime(record.date)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="status-badge status-present">
                                        <CheckCircle size={12} />
                                        Present
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', border: '1px dashed #d1d5db', borderRadius: '12px' }}>
                                No recent attendance records found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentDashboard
