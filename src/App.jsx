import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import QRGenerator from './pages/QRGenerator'
import MyClasses from './pages/MyClasses'
import AttendanceReports from './pages/AttendanceReports'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Teacher Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
                        <Route
                            path="/"
                            element={
                                <Layout>
                                    <QRGenerator />
                                </Layout>
                            }
                        />
                        <Route
                            path="/classes"
                            element={
                                <Layout>
                                    <MyClasses />
                                </Layout>
                            }
                        />
                        <Route
                            path="/reports"
                            element={
                                <Layout>
                                    <AttendanceReports />
                                </Layout>
                            }
                        />
                    </Route>

                    {/* Student Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                        <Route
                            path="/student-dashboard"
                            element={
                                <Layout>
                                    <StudentDashboard />
                                </Layout>
                            }
                        />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}

export default App
