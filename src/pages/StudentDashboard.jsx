import { QrCode } from 'lucide-react'

function StudentDashboard() {
    return (
        <div style={{ padding: '24px' }}>
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Student Dashboard</h2>
                    <p className="card-description">Welcome to your student portal</p>
                </div>

                <div className="qr-placeholder-box">
                    <QrCode className="qr-icon" />
                    <p>Scan a QR code to mark attendance</p>
                    {/* In a real app, this would open the camera */}
                </div>
            </div>
        </div>
    )
}

export default StudentDashboard
