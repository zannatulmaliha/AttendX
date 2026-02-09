import { useState } from 'react'
import { QrCode, User, GraduationCap } from 'lucide-react'

function Login() {
    const [role, setRole] = useState('student') // 'student' or 'teacher'

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

                <form className="login-form">
                    <div className="form-group">
                        <label className="form-label">
                            {role === 'student' ? 'Student Email' : 'Teacher Email'}
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder={role === 'student' ? 'student@university.edu' : 'teacher@university.edu'}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="button" className="btn-primary full-width">
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
            </div>
        </div>
    )
}

export default Login
