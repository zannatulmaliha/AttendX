import { useState } from 'react'
import { QrCode, ScanLine } from 'lucide-react'

function QRGenerator() {
    const [classes] = useState([
        {
            id: 1,
            code: 'CS 101',
            name: 'Introduction to Programming',
            schedule: 'Mon, Wed, Fri 9:00 AM',
            students: 45
        },
        {
            id: 2,
            code: 'CS 201',
            name: 'Data Structures',
            schedule: 'Tue, Thu 11:00 AM',
            students: 38
        },
        {
            id: 3,
            code: 'CS 301',
            name: 'Web Development',
            schedule: 'Mon, Wed 2:00 PM',
            students: 32
        }
    ])

    const [selectedClass, setSelectedClass] = useState(classes[0])
    const [qrGenerated, setQrGenerated] = useState(false)

    const handleClassChange = (e) => {
        const classId = parseInt(e.target.value)
        const selected = classes.find(c => c.id === classId)
        setSelectedClass(selected)
        setQrGenerated(false)
    }

    const handleGenerateQR = () => {
        setQrGenerated(true)
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
                    <select className="form-select" value={selectedClass.id} onChange={handleClassChange}>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>
                                {cls.code} - {cls.name}
                            </option>
                        ))}
                    </select>
                </div>

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
                        <p>{qrGenerated ? `QR Code for ${selectedClass.code}` : 'Select a class to generate QR code'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QRGenerator
