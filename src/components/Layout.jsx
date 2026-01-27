import { Link, useLocation } from 'react-router-dom'
import { QrCode, LogOut } from 'lucide-react'

function Layout({ children }) {
    const location = useLocation()

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
                            <h1>Teacher Dashboard</h1>
                            <p>teacher@demo.com</p>
                        </div>
                    </div>
                    <a href="#" className="logout-btn">
                        <LogOut size={16} />
                        Logout
                    </a>
                </div>

                {/* Navigation */}
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
            </header>

            {/* Main Content */}
            <main>{children}</main>
        </div>
    )
}

export default Layout
