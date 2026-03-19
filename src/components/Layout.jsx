import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { QrCode, LogOut, BarChart2, Users, TrendingUp, Calendar, Radio } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { BASE_URL } from '../config'

function Layout({ children }) {
    const location = useLocation()
    const { user, logout, isTeacher } = useAuth()
    const [stats, setStats] = useState({
        totalClasses: 0,
        totalStudents: 0,
        avgAttendance: 0,
        activeSession: 'OFF'
    })

    useEffect(() => {
        if (isTeacher) {
            const fetchStats = async () => {
                try {
                    const token = localStorage.getItem('token')
                    const response = await fetch(`${BASE_URL}/api/classes/stats`, {
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
                }
            }
            fetchStats()
        }
    }, [isTeacher])

    const isActive = (path) => {
        return location.pathname === path
    }

    if (!isTeacher) {
        return (
            <div className="container">
                <header>
                    <div className="header-content">
                        <div className="user-info">
                            <div className="logo-circle">
                                <QrCode size={20} />
                            </div>
                            <div className="user-details">
                                <h1>Student Dashboard</h1>
                                <p>{user?.email || 'user@example.com'}</p>
                            </div>
                        </div>
                        <button onClick={logout} className="logout-btn" style={{ cursor: 'pointer' }}>
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>
                <main>
                    {children}
                </main>
            </div>
        )
    }

    // Teacher Layout
    return (
        <div className="container teacher-container">
            {/* Header */}
            <header className="teacher-header">
                <div className="header-content">
                    <div className="user-info">
                        <div className="logo-box">
                            <QrCode size={24} color="white" />
                        </div>
                        <div className="user-details">
                            <h1 className="teacher-title">Teacher Dashboard</h1>
                            <p className="teacher-email">{user?.email || 'teacher@demo.com'}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="logout-btn-styled" style={{ cursor: 'pointer' }}>
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card purple">
                    <div className="stat-header">
                        <span>Total Classes</span>
                        <BarChart2 size={18} />
                    </div>
                    <div>
                        <div className="stat-value">{stats.totalClasses}</div>
                    </div>
                </div>
                
                <div className="stat-card pink" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                    <div className="stat-header">
                        <span>Total Students</span>
                        <Users size={18} />
                    </div>
                    <div>
                        <div className="stat-value">{stats.totalStudents}</div>
                    </div>
                </div>
                
                <div className="stat-card green">
                    <div className="stat-header">
                        <span>Avg Attendance</span>
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <div className="stat-value">{stats.avgAttendance}%</div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${stats.avgAttendance}%` }}></div>
                        </div>
                    </div>
                </div>
                
                <div className="stat-card red" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                    <div className="stat-header">
                        <span>Active Session</span>
                        <div style={{width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', marginRight: 2, marginTop: 4}}></div>
                    </div>
                    <div>
                        <div className="stat-value">{stats.activeSession}</div>
                    </div>
                </div>
            </div>

            {/* Navigation Pills */}
            <nav className="nav-pills">
                <Link to="/" className={`nav-pill ${isActive('/') ? 'active' : ''}`}>
                    <QrCode size={16} /> QR Generator
                </Link>
                <Link to="/reports" className={`nav-pill ${isActive('/reports') ? 'active' : ''}`}>
                    <BarChart2 size={16} /> Analytics
                </Link>
                <Link to="/classes" className={`nav-pill ${isActive('/classes') ? 'active' : ''}`}>
                    <Calendar size={16} /> My Classes
                </Link>
                <div className="nav-pill">
                    <Users size={16} /> Students
                </div>
            </nav>

            {/* Main Content */}
            <main className="teacher-main">
                {children}
            </main>
        </div>
    )
}

export default Layout
