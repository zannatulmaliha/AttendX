import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QrCode, User, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Register() {
    const [role, setRole] = useState('student')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await register(name, email, password, role)
            navigate(role === 'teacher' ? '/' : '/student-dashboard')
        } catch (err) {
            setError(err.message || 'Failed to register')
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-circle large">
                        <QrCode size={32} />
                    </div>
                    <h1>Create Account</h1>
                    <p>Sign up to start using AttendX</p>
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
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="user@university.edu"
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
                        Sign Up as {role === 'student' ? 'Student' : 'Teacher'}
                    </button>
                </form>

                <div className="demo-credentials" style={{ marginTop: '10px', paddingTop: '10px', borderTop: 'none' }}>
                    <p>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
