import { useState, useEffect } from 'react'
import { QrCode, ScanLine } from 'lucide-react'

function QRGenerator() {
    const [classes, setClasses] = useState([])
    const [selectedClass, setSelectedClass] = useState(null)
    const [qrGenerated, setQrGenerated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch classes from backend on component mount
    useEffect(() => {
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:5000/api/classes')
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

    const handleClassChange = (e) => {
        const classId = e.target.value
        const selected = classes.find(c => (c._id || c.id) === classId)
        setSelectedClass(selected)
        setQrGenerated(false)
    }

    const handleGenerateQR = () => {
        setQrGenerated(true)
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
                    <select className="form-select" value={selectedClass?._id || selectedClass?.id} onChange={handleClassChange}>
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

                        <button className="btn-primary" onClick={handleGenerateQR}>
                            <QrCode size={18} />
                            Generate New QR Code
                        </button>
                    </>
                )}
            </div>

            {/* Right Column: QR Display */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">QR Code</h2>
                    <p className="card-description">Students can scan this code to mark attendance</p>
                </div>

                <div className="qr-placeholder-container">
                    <div className="qr-placeholder-box">
                        <ScanLine size={48} className="qr-icon" />
                        <p>{qrGenerated && selectedClass ? `QR Code for ${selectedClass.code}` : 'Select a class to generate QR code'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QRGenerator
