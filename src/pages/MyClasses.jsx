import { useState } from 'react'
import { Plus, Users, Calendar, QrCode } from 'lucide-react'

function MyClasses() {
    const [classes, setClasses] = useState([
        {
            id: 1,
            code: 'CS 101',
            name: 'Introduction to Programming',
            schedule: 'Mon, Wed, Fri 9:00 AM',
            students: 45
        },
        {
            id: 2,
            code: 'CS 201',
            name: 'Data Structures',
            schedule: 'Tue, Thu 11:00 AM',
            students: 38
        },
        {
            id: 3,
            code: 'CS 301',
            name: 'Web Development',
            schedule: 'Mon, Wed 2:00 PM',
            students: 32
        }
    ])

    const handleGenerateQR = (classId) => {
        console.log(`Generating QR for class ${classId}`)
        // This could navigate to QR Generator page or open a modal
    }

    const handleAddClass = () => {
        console.log('Add new class clicked')
        // This could open a modal or navigate to a form
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

            <div className="classes-grid">
                {classes.map(cls => (
                    <div key={cls.id} className="class-card">
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

                        <button className="btn-outline" onClick={() => handleGenerateQR(cls.id)}>
                            <QrCode size={16} />
                            Generate QR
                        </button>
                    </div>
                ))}
            </div>
        </>
    )
}

export default MyClasses
