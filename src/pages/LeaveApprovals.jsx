import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { BASE_URL } from '../config'

function LeaveApprovals() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState(null)

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${BASE_URL}/api/leaves/teacher/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setRequests(data)
            }
        } catch (error) {
            console.error('Failed to fetch requests', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleStatusUpdate = async (id, status) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${BASE_URL}/api/leaves/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            })

            if (response.ok) {
                setMessage(`Leave request ${status.toLowerCase()} successfully`)
                fetchRequests()
                setTimeout(() => setMessage(null), 3000)
            }
        } catch (error) {
            console.error('Failed to update leave request status', error)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        })
    }

    return (
        <div className="leave-approvals-container" style={{ padding: '0 1rem' }}>
            <h2 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>Leave Approvals</h2>
            <p className="panel-subtitle" style={{ marginBottom: '2rem' }}>Review pending leave requests from your students</p>

            {message && (
                <div style={{ padding: '1rem', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #10b981' }}>
                    {message}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading...</div>
            ) : requests.length === 0 ? (
                <div className="panel-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem', color: '#111827' }}>All Caught Up!</h3>
                    <p style={{ color: '#6b7280' }}>There are no pending leave requests for your classes at this time.</p>
                </div>
            ) : (
                <div className="requests-grid" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {requests.map(req => (
                        <div key={req._id} className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.125rem', color: '#111827' }}>{req.studentId?.name || 'Unknown Student'}</h4>
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{req.studentId?.email}</span>
                            </div>
                            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}><strong style={{ color: '#374151' }}>Class:</strong> {req.classId?.code} - {req.classId?.name}</div>
                                <div style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}><strong style={{ color: '#374151' }}>Date:</strong> {formatDate(req.date)}</div>
                                <div style={{ fontSize: '0.95rem', lineHeight: '1.4' }}><strong style={{ color: '#374151' }}>Reason:</strong> {req.reason}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                                <button 
                                    style={{ flex: 1, padding: '0.75rem', background: '#10b981', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: '500', transition: 'background 0.2s' }}
                                    onClick={() => handleStatusUpdate(req._id, 'Approved')}
                                >
                                    <CheckCircle size={18} /> Approve
                                </button>
                                <button 
                                    style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: '500', transition: 'background 0.2s' }}
                                    onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                                >
                                    <XCircle size={18} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default LeaveApprovals
