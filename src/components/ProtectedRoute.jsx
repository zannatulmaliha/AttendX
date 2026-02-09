import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'student') return <Navigate to="/student-dashboard" replace />
        if (user.role === 'teacher') return <Navigate to="/" replace />
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
