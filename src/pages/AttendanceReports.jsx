import { CalendarOff } from 'lucide-react'

function AttendanceReports() {
    return (
        <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
                <h2 className="card-title">Attendance Reports</h2>
                <p className="card-description">View and download attendance statistics</p>
            </div>

            <div className="empty-state">
                <CalendarOff size={64} className="empty-icon" />
                <h3 className="empty-title">Attendance reporting coming soon</h3>
                <p>Export data as CSV or PDF</p>
            </div>
        </div>
    )
}

export default AttendanceReports
