import { useState, useEffect } from 'react'
import { Users, GraduationCap, BookOpen, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { BASE_URL } from '../config'

function AdminDashboard() {
    const { logout, user } = useAuth()
    const [stats, setStats] = useState({ totalTeachers: 0, totalStudents: 0, totalClasses: 0 })
    const [systemUsers, setSystemUsers] = useState([])
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true)
            try {
                const token = localStorage.getItem('token')
                const headers = { 'Authorization': `Bearer ${token}` }

                const [statsRes, usersRes, classesRes] = await Promise.all([
                    fetch(`${BASE_URL}/api/admin/stats`, { headers }),
                    fetch(`${BASE_URL}/api/admin/users`, { headers }),
                    fetch(`${BASE_URL}/api/admin/classes`, { headers })
                ])

                if (statsRes.ok) setStats(await statsRes.json())
                if (usersRes.ok) setSystemUsers(await usersRes.json())
                if (classesRes.ok) setClasses(await classesRes.json())

            } catch (err) {
                console.error('Failed to load admin data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAdminData()
    }, [])

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#4f46e5', color: 'white', padding: '0.75rem', borderRadius: '12px' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, color: '#111827', fontSize: '1.8rem' }}>Admin Portal</h1>
                        <p style={{ margin: 0, color: '#6b7280' }}>Global Management Dashboard</p>
                    </div>
                </div>
                <button 
                    onClick={logout} 
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                    Logout
                </button>
            </header>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading global administrative data...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: '#4b5563', fontWeight: '600', fontSize: '1.1rem' }}>Total Students</span>
                                <Users size={24} color="#3b82f6" />
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827' }}>{stats.totalStudents}</div>
                        </div>

                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: '#4b5563', fontWeight: '600', fontSize: '1.1rem' }}>Total Teachers</span>
                                <GraduationCap size={24} color="#10b981" />
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827' }}>{stats.totalTeachers}</div>
                        </div>

                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: '#4b5563', fontWeight: '600', fontSize: '1.1rem' }}>Total Classes</span>
                                <BookOpen size={24} color="#8b5cf6" />
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#111827' }}>{stats.totalClasses}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                        {/* Users Table */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                            <div style={{ padding: '1.2rem 1.5rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <h3 style={{ margin: 0, color: '#374151', fontSize: '1.2rem' }}>User Directory ({systemUsers.length})</h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                                            <th style={{ padding: '1rem 1.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Name</th>
                                            <th style={{ padding: '1rem 1.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Email</th>
                                            <th style={{ padding: '1rem 1.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {systemUsers.map(u => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '1rem 1.5rem', color: '#111827', fontWeight: '500' }}>{u.name}</td>
                                                <td style={{ padding: '1rem 1.5rem', color: '#4b5563' }}>{u.email}</td>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <span style={{
                                                        padding: '0.35rem 0.85rem', 
                                                        borderRadius: '999px', 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: '600',
                                                        letterSpacing: '0.025em',
                                                        backgroundColor: u.role === 'admin' ? '#f3e8ff' : u.role === 'teacher' ? '#d1fae5' : '#e0f2fe',
                                                        color: u.role === 'admin' ? '#7e22ce' : u.role === 'teacher' ? '#047857' : '#0369a1'
                                                    }}>
                                                        {u.role.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Classes Table */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                            <div style={{ padding: '1.2rem 1.5rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <h3 style={{ margin: 0, color: '#374151', fontSize: '1.2rem' }}>All Active Classes ({classes.length})</h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                                            <th style={{ padding: '1rem 1.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Code</th>
                                            <th style={{ padding: '1rem 1.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Subject Name</th>
                                            <th style={{ padding: '1rem 1.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Instructor</th>
                                            <th style={{ padding: '1rem 1.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Schedule</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classes.map(c => (
                                            <tr key={c._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '1rem 1.5rem', color: '#111827', fontWeight: '600' }}>{c.code}</td>
                                                <td style={{ padding: '1rem 1.5rem', color: '#111827', fontWeight: '500' }}>{c.name}</td>
                                                <td style={{ padding: '1rem 1.5rem', color: '#4b5563' }}>{c.teacher?.name || 'Unknown'}</td>
                                                <td style={{ padding: '1rem 1.5rem', color: '#4b5563' }}>{c.schedule}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default AdminDashboard
