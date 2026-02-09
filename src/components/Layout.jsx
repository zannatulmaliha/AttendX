import { Link, useLocation } from 'react-router-dom'
import { QrCode, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Layout({ children }) {
    const location = useLocation()
    const { user, logout, isTeacher } = useAuth()

    const isActive = (path) => {
        return location.pathname === path
    }

    return (
        <div className="container">
            {/* Header */}
            <header>
                <div className="header-content">
                    <div className="user-info">
                        <div className="logo-circle">
                            <QrCode size={20} />
                        </div>
                        <div className="user-details">
                            <h1>{isTeacher ? 'Teacher Dashboard' : 'Student Dashboard'}</h1>
                            <p>{user?.email || 'user@example.com'}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="logout-btn" style={{ cursor: 'pointer' }}>
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>

                {/* Navigation - Only for Teachers for now, as Students have a single dashboard */}
                {isTeacher && (
                    <nav className="nav-tabs">
                        <Link to="/" className={`nav-tab ${isActive('/') ? 'active' : ''}`}>
                            QR Generator
                        </Link>
                        <Link to="/classes" className={`nav-tab ${isActive('/classes') ? 'active' : ''}`}>
                            My Classes
                        </Link>
                        <Link to="/reports" className={`nav-tab ${isActive('/reports') ? 'active' : ''}`}>
                            Attendance Reports
                        </Link>
                    </nav>
                )}
            </header>

            {/* Main Content */}
            <main>{children}</main>
        </div>
    )
}

export default Layout
