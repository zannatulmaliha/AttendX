import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { CheckCircle, XCircle, Camera, BookOpen, Clock, Calendar, CheckSquare, Zap, Target, Award, Play, FileText, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { BASE_URL } from '../config'

function StudentDashboard() {
    const { user, logout } = useAuth()
    const [scanResult, setScanResult] = useState(null)
    const [isScanning, setIsScanning] = useState(false)
    const [message, setMessage] = useState(null)
    const [status, setStatus] = useState(null) // 'success' or 'error'
    const scannerRef = useRef(null)

    // Leave request state
    const [classes, setClasses] = useState([])
    const [leaveRequests, setLeaveRequests] = useState([])
    const [leaveForm, setLeaveForm] = useState({ classId: '', date: '', reason: '' })
    const [leaveMessage, setLeaveMessage] = useState(null)
    const [leaveStatus, setLeaveStatus] = useState(null)

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

    // Fetch classes and student's leave requests
    useEffect(() => {
        const fetchLeavesAndClasses = async () => {
            try {
                const token = localStorage.getItem('token')
                const classRes = await fetch(`${BASE_URL}/api/classes/all`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (classRes.ok) {
                    const classData = await classRes.json()
                    setClasses(classData)
                }

                const leavesRes = await fetch(`${BASE_URL}/api/leaves/student`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (leavesRes.ok) {
                    const leavesData = await leavesRes.json()
                    setLeaveRequests(leavesData)
                }
            } catch (err) {
                console.error("Failed to fetch leaves/classes", err)
            }
        }
        fetchLeavesAndClasses()
    }, [])

    const handleLeaveSubmit = async (e) => {
        e.preventDefault()
        setLeaveMessage('Submitting request...')
        setLeaveStatus('loading')
        
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${BASE_URL}/api/leaves`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(leaveForm)
            })
            
            if (response.ok) {
                setLeaveStatus('success')
                setLeaveMessage('Leave request submitted successfully')
                setLeaveForm({ classId: '', date: '', reason: '' })
                const leavesRes = await fetch(`${BASE_URL}/api/leaves/student`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (leavesRes.ok) {
                    const leavesData = await leavesRes.json()
                    setLeaveRequests(leavesData)
                }
                setTimeout(() => { setLeaveMessage(null); setLeaveStatus(null) }, 3000)
            } else {
                throw new Error('Failed to submit leave request')
            }
        } catch (err) {
            setLeaveStatus('error')
            setLeaveMessage('Error: ' + err.message)
            setTimeout(() => { setLeaveMessage(null); setLeaveStatus(null) }, 3000)
        }
    }

    useEffect(() => {
        if (isScanning && !scannerRef.current) {
            // Initialize scanner
            const scanner = new Html5QrcodeScanner(
                "reader",
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    rememberLastUsedCamera: false
                },
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

                {/* Leave Requests Panel */}
                <div className="panel-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="panel-header">
                        <FileText size={20} />
                        <h3>Leave Requests</h3>
                    </div>
                    <p className="panel-subtitle">Request a leave of absence for an upcoming class</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Leave Request Form */}
                        <div>
                            <form onSubmit={handleLeaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Select Class</label>
                                    <select 
                                        required 
                                        value={leaveForm.classId} 
                                        onChange={(e) => setLeaveForm({...leaveForm, classId: e.target.value})}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white' }}
                                    >
                                        <option value="" disabled>Select a class...</option>
                                        {classes.map(c => (
                                            <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Date</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={leaveForm.date} 
                                        onChange={(e) => setLeaveForm({...leaveForm, date: e.target.value})}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Reason</label>
                                    <textarea 
                                        required 
                                        rows="3" 
                                        placeholder="Briefly explain your reason for absence..."
                                        value={leaveForm.reason} 
                                        onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }}
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    style={{ padding: '0.75rem', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                    disabled={leaveStatus === 'loading'}
                                >
                                    <Send size={16} />
                                    {leaveStatus === 'loading' ? 'Submitting...' : 'Submit Request'}
                                </button>
                                
                                {leaveMessage && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: leaveStatus === 'error' ? '#ef4444' : '#10b981', textAlign: 'center', fontWeight: '500' }}>
                                        {leaveMessage}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Recent Requests List */}
                        <div>
                            <h4 style={{ marginBottom: '1rem', color: '#374151', fontSize: '1.05rem' }}>My Recent Requests</h4>
                            {leaveRequests.length === 0 ? (
                                <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '12px', border: '1px dashed #d1d5db', textAlign: 'center', color: '#6b7280' }}>
                                    You haven't submitted any leave requests yet.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                    {leaveRequests.map(req => (
                                        <div key={req._id} style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#111827' }}>{req.classId?.code}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{formatDate(req.date)}</div>
                                                </div>
                                                {req.status === 'Pending' && <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Pending</span>}
                                                {req.status === 'Approved' && <span style={{ background: '#d1fae5', color: '#059669', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Approved</span>}
                                                {req.status === 'Rejected' && <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Rejected</span>}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{req.reason}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentDashboard
