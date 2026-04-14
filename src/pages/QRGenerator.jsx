import { useState, useEffect, useRef } from 'react'
import { QrCode, ScanLine, AlertCircle } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { io } from 'socket.io-client'
import { BASE_URL } from '../config'

function QRGenerator() {
    const [classes, setClasses] = useState([])
    const [selectedClass, setSelectedClass] = useState(null)
    const [qrValue, setQrValue] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [liveScans, setLiveScans] = useState([])
    const intervalRef = useRef(null)
    const socketRef = useRef(null)

    // Setup Socket.IO connection
    useEffect(() => {
        const host = BASE_URL || window.location.origin;
        socketRef.current = io(host, { path: '/socket.io' });

        socketRef.current.on('attendanceMarked', (data) => {
            setLiveScans(prev => [data, ...prev]);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    // Join room when starting generation
    useEffect(() => {
        if (isGenerating && selectedClass && socketRef.current) {
            socketRef.current.emit('joinClassRoom', selectedClass._id || selectedClass.id);
        }
    }, [isGenerating, selectedClass]);

    // Fetch classes from backend on component mount
    useEffect(() => {
        fetchClasses()
        return () => stopGeneration()
    }, [])

    const fetchClasses = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${BASE_URL}/api/classes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) throw new Error('Failed to fetch classes')
            const data = await response.json()
            setClasses(data)
            if (data.length > 0) {
                setSelectedClass(data[0])
            }
            setError(null)
        } catch (err) {
            console.error('Error fetching classes:', err)
            setError('Failed to load classes. Make sure the backend server is running.')
        } finally {
            setLoading(false)
        }
    }

    const fetchQrToken = async () => {
        if (!selectedClass) return

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${BASE_URL}/api/attendance/qr-token/${selectedClass._id || selectedClass.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to generate QR token')
            }

            const data = await response.json()
            setQrValue(data.token) // The token is what the student scans
        } catch (err) {
            console.error('Error generating QR token:', err)
            setIsGenerating(false)
            stopGeneration()
            alert('Failed to generate QR code. Please try again.')
        }
    }

    const startGeneration = () => {
        setIsGenerating(true)
        setLiveScans([]) // Clear old scans when restarting
        fetchQrToken() // Fetch immediately
        // Fetch every 15 seconds (15000ms)
        // Since token expires in 60s, a 15s refresh gives 45s of overlap for network latency!
        intervalRef.current = setInterval(fetchQrToken, 15000)
    }

    const stopGeneration = () => {
        setIsGenerating(false)
        setQrValue(null)
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }

    const handleClassChange = (e) => {
        stopGeneration()
        const classId = e.target.value
        const selected = classes.find(c => (c._id || c.id) === classId)
        setSelectedClass(selected)
    }

    const toggleGeneration = () => {
        if (isGenerating) {
            stopGeneration()
        } else {
            startGeneration()
        }
    }

    if (loading) {
        return (
            <div className="card">
                <div className="empty-state">
                    <p>Loading classes...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="card">
                <div className="empty-state">
                    <p style={{ color: 'var(--danger)' }}>{error}</p>
                </div>
            </div>
        )
    }

    if (classes.length === 0) {
        return (
            <div className="card">
                <div className="empty-state">
                    <p>No classes available. Please add a class in "My Classes" first.</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {/* Left Column: Form & QR Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Generate QR Code</h2>
                    <p className="card-description">Select a class to generate attendance QR code</p>
                </div>

                <div className="form-group">
                    <label className="form-label">Select Class</label>
                    <select className="form-select" value={selectedClass?._id || selectedClass?.id} onChange={handleClassChange} disabled={isGenerating}>
                        {classes.map(cls => (
                            <option key={cls._id || cls.id} value={cls._id || cls.id}>
                                {cls.code} - {cls.name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedClass && (
                    <>
                        <div className="class-info">
                            <div className="info-row">
                                <span className="info-label">Class Name:</span>
                                <span className="info-value">{selectedClass.name}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Code:</span>
                                <span className="info-value">{selectedClass.code}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Schedule:</span>
                                <span className="info-value">{selectedClass.schedule}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Students:</span>
                                <span className="info-value">{selectedClass.students}</span>
                            </div>
                        </div>

                        <button
                            className={`btn-primary ${isGenerating ? 'btn-danger' : ''}`}
                            onClick={toggleGeneration}
                            style={{ backgroundColor: isGenerating ? '#dc2626' : '' }}
                        >
                            <QrCode size={18} />
                            {isGenerating ? 'Stop Generating' : 'Start QR Generation'}
                        </button>

                        {isGenerating && (
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#16a34a' }}>
                                <div className="pulse-dot"></div>
                                Live: Updating every 2 min
                            </div>
                        )}
                    </>
                )}
                </div>

                {/* Left Column - Part 2: QR Display */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">QR Code Display</h2>
                        <p className="card-description">Display this code on the projector</p>
                    </div>

                    <div className="qr-placeholder-container">
                        <div className="qr-placeholder-box">
                            {isGenerating && qrValue ? (
                                <div style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
                                    <QRCodeCanvas value={qrValue} size={250} />
                                </div>
                            ) : (
                                <>
                                    <ScanLine size={48} className="qr-icon" />
                                    <p>{selectedClass ? 'Click "Start" to generate QR code' : 'Select a class to start'}</p>
                                </>
                            )}
                        </div>
                        {isGenerating && (
                            <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                                This QR code refreshes securely every 15 seconds.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Live Scans Tracker */}
            <div className="card" style={{ minHeight: '600px', maxHeight: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', position: 'sticky', top: '2rem' }}>
                <div className="card-header">
                    <h2 className="card-title">Live Check-ins</h2>
                    <p className="card-description">Real-time attendance monitor</p>
                </div>
                
                <div className="live-scans-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', opacity: isGenerating ? 1 : 0.5, transition: 'opacity 0.3s ease' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#16a34a' }}>
                        {isGenerating && <div className="pulse-dot"></div>} Tracker Online
                    </h3>
                    
                    <div className="scans-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {!isGenerating ? (
                            <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '12px', border: '2px dashed #d1d5db', textAlign: 'center', color: '#6b7280', margin: 'auto 0' }}>
                                Start generating QR code to track live scans
                            </div>
                        ) : liveScans.length === 0 ? (
                            <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '12px', border: '2px dashed #d1d5db', textAlign: 'center', color: '#6b7280', margin: 'auto 0' }}>
                                Waiting for students to scan...
                            </div>
                        ) : (
                            liveScans.map((scan) => (
                                <div key={scan._id || Math.random()} className="scan-item animate-slide-in" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: '#22c55e', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                                            ✓
                                        </div>
                                        <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#166534' }}>{scan.studentName}</span>
                                    </div>
                                    <div style={{ fontSize: '1rem', color: '#166534', fontWeight: '500' }}>
                                        {new Date(scan.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    background-color: #16a34a;
                    border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-slide-in {
                    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes slideIn {
                    0% { transform: translateX(-20px); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

export default QRGenerator
