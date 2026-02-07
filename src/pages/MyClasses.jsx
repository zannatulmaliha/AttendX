import { useState, useEffect } from 'react'
import { Plus, Users, Calendar, QrCode, X } from 'lucide-react'

function MyClasses() {
    const [classes, setClasses] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        schedule: ''
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch classes from backend on component mount
    useEffect(() => {
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:5000/api/classes')
            if (!response.ok) throw new Error('Failed to fetch classes')
            const data = await response.json()
            setClasses(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching classes:', err)
            setError('Failed to load classes. Make sure the backend server is running.')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateQR = (classId) => {
        console.log(`Generating QR for class ${classId}`)
        // This could navigate to QR Generator page or open a modal
    }

    const handleAddClass = () => {
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setFormData({ code: '', name: '', schedule: '' })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch('http://localhost:5000/api/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: formData.code,
                    name: formData.name,
                    schedule: formData.schedule,
                    students: 0
                })
            })

            if (!response.ok) throw new Error('Failed to create class')

            const newClass = await response.json()

            // Add the new class to the local state
            setClasses(prev => [...prev, newClass])

            // Close modal and reset form
            handleCloseModal()
        } catch (err) {
            console.error('Error creating class:', err)
            alert('Failed to create class. Make sure the backend server is running.')
        }
    }

    return (
        <>
            <div className="page-header">
                <h2 className="page-title">My Classes</h2>
                <a href="#" className="btn-black" onClick={(e) => { e.preventDefault(); handleAddClass(); }}>
                    <Plus size={16} />
                    Add New Class
                </a>
            </div>

            {loading && (
                <div className="empty-state">
                    <p>Loading classes...</p>
                </div>
            )}

            {error && (
                <div className="empty-state">
                    <p style={{ color: 'var(--danger)' }}>{error}</p>
                </div>
            )}

            {!loading && !error && classes.length === 0 && (
                <div className="empty-state">
                    <p>No classes yet. Click "Add New Class" to get started!</p>
                </div>
            )}

            {!loading && !error && classes.length > 0 && (
                <div className="classes-grid">
                    {classes.map(cls => (
                        <div key={cls._id || cls.id} className="class-card">
                            <div className="class-card-header">
                                <span className="class-code">{cls.code}</span>
                                <div className="student-count">
                                    <Users size={14} />
                                    {cls.students}
                                </div>
                            </div>
                            <div className="class-name">{cls.name}</div>

                            <div className="class-schedule">
                                <Calendar size={16} />
                                {cls.schedule}
                            </div>

                            <button className="btn-outline" onClick={() => handleGenerateQR(cls._id || cls.id)}>
                                <QrCode size={16} />
                                Generate QR
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Class Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Class</h3>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="code">Class Code</label>
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder="e.g., CS 101"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="name">Class Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Introduction to Programming"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="schedule">Schedule</label>
                                <input
                                    type="text"
                                    id="schedule"
                                    name="schedule"
                                    value={formData.schedule}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Mon, Wed, Fri 9:00 AM"
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-outline" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-black">
                                    Add Class
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default MyClasses
