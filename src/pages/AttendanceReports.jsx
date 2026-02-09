import { useState, useEffect } from 'react'
import { CalendarOff } from 'lucide-react'
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
            const response = await fetch('http://localhost:5000/api/attendance/all', {
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
            <div className="card-header">
                <h2 className="card-title">Attendance Reports</h2>
                <p className="card-description">View and download attendance statistics</p>
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
        </div>
    )
}

export default AttendanceReports
