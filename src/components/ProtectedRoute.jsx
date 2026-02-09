import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ allowedRoles }) => {
<<<<<<< HEAD
    const { user, isAuthenticated, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>
=======
    const { user, loading, isAuthenticated } = useAuth()

    if (loading) {
        return <div>Loading...</div> // Or a proper loading spinner
>>>>>>> f46442d5f434df5fa94ac4cfe00ce7befdf87f61
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
<<<<<<< HEAD
        if (user.role === 'student') return <Navigate to="/student-dashboard" replace />
        if (user.role === 'teacher') return <Navigate to="/" replace />
        return <Navigate to="/" replace />
=======
        if (user.role === 'student') {
            return <Navigate to="/student-dashboard" replace />
        } else {
            return <Navigate to="/" replace />
        }
>>>>>>> f46442d5f434df5fa94ac4cfe00ce7befdf87f61
    }

    return <Outlet />
}

export default ProtectedRoute
