import { useState, useEffect, useRef } from 'react'
import { QrCode, ScanLine, AlertCircle } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

function QRGenerator() {
    const [classes, setClasses] = useState([])
    const [selectedClass, setSelectedClass] = useState(null)
    const [qrValue, setQrValue] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const intervalRef = useRef(null)

    // Fetch classes from backend on component mount
    useEffect(() => {
        fetchClasses()
        return () => stopGeneration()
    }, [])

    const fetchClasses = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:5000/api/classes', {
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
            const response = await fetch(`http://localhost:5000/api/attendance/qr-token/${selectedClass._id || selectedClass.id}`, {
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
        fetchQrToken() // Fetch immediately
        // Fetch every 3 seconds (3000ms)
        // Since token expires in 10s, 3s refresh gives plenty of overlap
        intervalRef.current = setInterval(fetchQrToken, 3000)
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
        <div className="card-grid">
            {/* Left Column: Generate Form */}
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
                                Live: Updating every 3 seconds
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Right Column: QR Display */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">QR Code Display</h2>
                    <p className="card-description">Students scan this code to mark attendance</p>
                </div>

                <div className="qr-placeholder-container">
                    <div className="qr-placeholder-box">
                        {isGenerating && qrValue ? (
                            <div style={{ padding: '10px', background: 'white' }}>
                                <QRCodeCanvas value={qrValue} size={200} />
                            </div>
                        ) : (
                            <>
                                <ScanLine size={48} className="qr-icon" />
                                <p>{selectedClass ? 'Click "Start" to generate QR code' : 'Select a class to start'}</p>
                            </>
                        )}
                    </div>
                    {isGenerating && (
                        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
                            This QR code changes dynamically.
                        </p>
                    )}
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
            `}</style>
        </div>
    )
}

export default QRGenerator
