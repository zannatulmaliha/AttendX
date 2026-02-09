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
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                throw new Error(`Account exists but is registered as a ${data.user.role}. Please switch to the ${data.user.role === 'student' ? 'Student' : 'Teacher'} tab.`)
            }

            // Redirect based on role
            if (data.user.role === 'student') {
                navigate('/student-dashboard')
            } else {
                navigate('/')
            }
        } catch (err) {
            if (localStorage.getItem('token')) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.reload()
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
