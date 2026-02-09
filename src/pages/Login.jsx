import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QrCode, User, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Login() {
    const [role, setRole] = useState('student') // 'student' or 'teacher'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const data = await login(email, password)

            // Validation: Check if the authenticated user's role matches the selected tab
            if (data.user.role !== role) {
<<<<<<< HEAD
                localStorage.removeItem('token')
                localStorage.removeItem('user')
=======
                // If trying to login as Student but account is Teacher, or vice versa
                // We need to logout immediately to clear the session
                // We can't use the logout function from useAuth because we are in the middle of a function
                // But we can clear localStorage and throw an error which will be caught below
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                // We also need to update the state in AuthContext, but we can't easily do that here without exposing a reset function
                // Instead, let's just reload the page or rely on the error message
                // Actually, calling logout() from useAuth might work if it doesn't cause a re-render race condition
                // But since login() sets the user state, we are already authenticated in context.

                // Better approach: Throw error and let the user try again
>>>>>>> f46442d5f434df5fa94ac4cfe00ce7befdf87f61
                throw new Error(`Account exists but is registered as a ${data.user.role}. Please switch to the ${data.user.role === 'student' ? 'Student' : 'Teacher'} tab.`)
            }

            // Redirect based on role
            if (data.user.role === 'student') {
                navigate('/student-dashboard')
            } else {
                navigate('/')
            }
        } catch (err) {
<<<<<<< HEAD
            if (localStorage.getItem('token')) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.reload()
=======
            // Ensure we are logged out if we throw an error after successful login
            if (localStorage.getItem('token')) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                // We might need to force a context update, but for now this clears persistence
                window.location.reload() // Brute force ensuring state is clear
>>>>>>> f46442d5f434df5fa94ac4cfe00ce7befdf87f61
            }
            setError(err.message || 'Failed to login')
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-circle large">
                        <QrCode size={32} />
                    </div>
                    <h1>QR Attendance System</h1>
                    <p>Sign in to mark or manage attendance</p>
                </div>

                <div className="role-toggle">
                    <button
                        className={`toggle-btn ${role === 'student' ? 'active' : ''}`}
                        onClick={() => setRole('student')}
                    >
                        Student
                    </button>
                    <button
                        className={`toggle-btn ${role === 'teacher' ? 'active' : ''}`}
                        onClick={() => setRole('teacher')}
                    >
                        Teacher
                    </button>
                </div>

                {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            {role === 'student' ? 'Student Email' : 'Teacher Email'}
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder={role === 'student' ? 'student@university.edu' : 'teacher@university.edu'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary full-width">
                        {role === 'student' ? <User size={18} /> : <GraduationCap size={18} />}
                        Sign In as {role === 'student' ? 'Student' : 'Teacher'}
                    </button>
                </form>

                <div className="demo-credentials">
                    <p>Demo credentials:</p>
                    <div className="credentials-list">
                        <span>Student: student@demo.com / demo123</span>
                        <span>Teacher: teacher@demo.com / demo123</span>
                    </div>
                </div>

                <div className="demo-credentials" style={{ marginTop: '10px', paddingTop: '10px', borderTop: 'none' }}>
                    <p>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
