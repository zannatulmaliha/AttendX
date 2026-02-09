import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import QRGenerator from './pages/QRGenerator'
import MyClasses from './pages/MyClasses'
import AttendanceReports from './pages/AttendanceReports'
import Login from './pages/Login'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Protected Routes wrapped in Layout */}
                <Route
                    path="/*"
                    element={
                        <Layout>
                            <Routes>
                                <Route path="/" element={<QRGenerator />} />
                                <Route path="/classes" element={<MyClasses />} />
                                <Route path="/reports" element={<AttendanceReports />} />
                            </Routes>
                        </Layout>
                    }
                />
            </Routes>
        </Router>
    )
}

export default App
