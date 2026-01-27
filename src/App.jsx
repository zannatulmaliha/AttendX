import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import QRGenerator from './pages/QRGenerator'
import MyClasses from './pages/MyClasses'
import AttendanceReports from './pages/AttendanceReports'

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<QRGenerator />} />
                    <Route path="/classes" element={<MyClasses />} />
                    <Route path="/reports" element={<AttendanceReports />} />
                </Routes>
            </Layout>
        </Router>
    )
}

export default App
