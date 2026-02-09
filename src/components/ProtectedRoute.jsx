import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth()

    if (loading) {
        return <div>Loading...</div> // Or a proper loading spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'student') {
            return <Navigate to="/student-dashboard" replace />
        } else {
            return <Navigate to="/" replace />
        }
    }

    return <Outlet />
}

export default ProtectedRoute
