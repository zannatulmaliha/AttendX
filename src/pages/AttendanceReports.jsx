import { useState, useEffect } from 'react'
import { CalendarOff, Download } from 'lucide-react'
import { BASE_URL } from '../config'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

function AttendanceReports() {
    const [attendanceData, setAttendanceData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchAttendanceData()
    }, [])

    const fetchAttendanceData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${BASE_URL}/api/attendance/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) throw new Error('Failed to fetch attendance data')
            const data = await response.json()
            setAttendanceData(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching attendance:', err)
            setError('Failed to load attendance data. Make sure the backend server is running.')
        } finally {
            setLoading(false)
        }
    }

    // Export to CSV
    const exportToCSV = () => {
        if (!attendanceData || attendanceData.length === 0) return;
        
        const headers = ['Date', 'Class Code', 'Class Name', 'Student Name', 'Status'];
        const csvRows = [headers.join(',')];

        attendanceData.forEach(record => {
            const date = new Date(record.date).toLocaleDateString();
            const classCode = record.classId?.code || 'N/A';
            const className = record.classId?.name || 'N/A';
            const studentName = record.studentName || record.studentId?.name || 'Unknown';
            const status = record.status;
            
            const row = [date, classCode, className, studentName, status].map(value => `"${value}"`);
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'attendance_report.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Process attendance data for chart
    const processChartData = () => {
        if (!attendanceData || attendanceData.length === 0) {
            return null
        }

        // Group attendance by class
        const classMap = {}
        attendanceData.forEach(record => {
            const classInfo = record.classId
            const classKey = classInfo?._id || classInfo?.id || 'Unknown'
            const className = classInfo?.name || classInfo?.code || 'Unknown Class'

            if (!classMap[classKey]) {
                classMap[classKey] = {
                    name: className,
                    present: 0,
                    absent: 0
                }
            }

            if (record.status === 'Present') {
                classMap[classKey].present++
            } else if (record.status === 'Absent') {
                classMap[classKey].absent++
            }
        })

        const classes = Object.values(classMap)
        const labels = classes.map(c => c.name)
        const presentData = classes.map(c => c.present)
        const absentData = classes.map(c => c.absent)

        return {
            labels,
            datasets: [
                {
                    label: 'Present',
                    data: presentData,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Absent',
                    data: absentData,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }
            ]
        }
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Attendance Statistics by Course',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    afterLabel: function (context) {
                        const datasetIndex = context.datasetIndex
                        const dataIndex = context.dataIndex
                        const present = context.chart.data.datasets[0].data[dataIndex]
                        const absent = context.chart.data.datasets[1].data[dataIndex]
                        const total = present + absent
                        const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0
                        return `Percentage: ${percentage}%`
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    }

    const chartData = processChartData()

    return (
        <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 className="card-title">Attendance Reports</h2>
                    <p className="card-description">View and download attendance statistics</p>
                </div>
                {!loading && !error && attendanceData && attendanceData.length > 0 && (
                    <button 
                        onClick={exportToCSV}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}
                        onMouseOver={(e) => e.target.style.background = '#2563eb'}
                        onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                    >
                        <Download size={16} /> Export CSV
                    </button>
                )}
            </div>

            {loading && (
                <div className="empty-state">
                    <p>Loading attendance data...</p>
                </div>
            )}

            {error && (
                <div className="empty-state">
                    <p style={{ color: 'var(--danger)' }}>{error}</p>
                </div>
            )}

            {!loading && !error && (!attendanceData || attendanceData.length === 0) && (
                <div className="empty-state">
                    <CalendarOff size={64} className="empty-icon" />
                    <h3 className="empty-title">No attendance data yet</h3>
                    <p>Attendance records will appear here once students start marking attendance</p>
                </div>
            )}

            {!loading && !error && chartData && (
                <div style={{ padding: '24px', height: '400px' }}>
                    <Bar data={chartData} options={chartOptions} />
                </div>
            )}

            {/* Raw Data Table */}
            {!loading && !error && attendanceData && attendanceData.length > 0 && (
                <div style={{ marginTop: '24px', overflowX: 'auto', padding: '0 24px 24px' }}>
                    <h3 style={{ marginBottom: '16px', color: '#374151', fontSize: '1.1rem' }}>Raw Attendance Records</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '12px', color: '#4b5563', fontWeight: '600', borderTopLeftRadius: '8px' }}>Date</th>
                                <th style={{ padding: '12px', color: '#4b5563', fontWeight: '600' }}>Class</th>
                                <th style={{ padding: '12px', color: '#4b5563', fontWeight: '600' }}>Student</th>
                                <th style={{ padding: '12px', color: '#4b5563', fontWeight: '600', borderTopRightRadius: '8px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceData.map((record, idx) => (
                                <tr key={record._id || idx} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '12px', color: '#374151' }}>{new Date(record.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px', color: '#374151' }}>{record.classId?.code}</td>
                                    <td style={{ padding: '12px', color: '#374151' }}>{record.studentName || record.studentId?.name || 'Unknown'}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ 
                                            background: record.status === 'Present' ? '#d1fae5' : '#fee2e2', 
                                            color: record.status === 'Present' ? '#059669' : '#dc2626',
                                            padding: '4px 8px', 
                                            borderRadius: '999px',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            display: 'inline-block'
                                        }}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AttendanceReports
