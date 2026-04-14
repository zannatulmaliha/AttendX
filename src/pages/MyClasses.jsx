import { useState, useEffect } from 'react'
import { Plus, Users, Calendar, QrCode, X, Trash2, Settings, LocateFixed, Search } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix React-Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) { setPosition(e.latlng) },
    })
    return position === null ? null : <Marker position={position}></Marker>
}

function FlyToLocation({ coordinates, trigger }) {
    const map = useMap();
    useEffect(() => {
        if (trigger > 0) {
            map.flyTo(coordinates, 15);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]);
    return null;
}
import { BASE_URL } from '../config'

function MyClasses() {
    const [classes, setClasses] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        schedule: '',
        students: 0,
        allowedDomain: '',
        geofence: { enabled: false, latitude: 51.505, longitude: -0.09, radius: 50 }
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // Settings Modal State
    const [editClass, setEditClass] = useState(null)
    const [editSettings, setEditSettings] = useState({
        allowedDomain: '',
        geofence: { enabled: false, latitude: 40.7128, longitude: -74.0060, radius: 50 }
    })
    const [savingSettings, setSavingSettings] = useState(false)
    const [mapFlyTrigger, setMapFlyTrigger] = useState(0)
    const [mapSearchQuery, setMapSearchQuery] = useState('')
    
    // Autocomplete states
    const [searchResults, setSearchResults] = useState([])
    const [showResults, setShowResults] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (mapSearchQuery.trim().length > 2 && showResults) {
                setIsSearching(true)
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}&limit=5`);
                    const data = await res.json();
                    setSearchResults(data || []);
                } catch (e) {
                    console.error("Autocomplete error:", e);
                } finally {
                    setIsSearching(false)
                }
            } else if (mapSearchQuery.trim().length === 0) {
                setSearchResults([]);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [mapSearchQuery, showResults]);

    const handleSelectLocation = (result, isEditMode) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        if (isEditMode) {
            setEditSettings(p => ({...p, geofence: {...p.geofence, latitude: lat, longitude: lon}}));
        } else {
            setFormData(p => ({...p, geofence: {...p.geofence, latitude: lat, longitude: lon}}));
        }
        setMapFlyTrigger(Date.now());
        setMapSearchQuery(result.display_name.split(',')[0]); 
        setShowResults(false);
    }

    const handleSearchLocation = async (isEditMode) => {
        if (!mapSearchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                handleSelectLocation(data[0], isEditMode);
            } else {
                alert("Location not found.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    }

    // Fetch classes from backend on component mount
    useEffect(() => {
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${BASE_URL}/api/classes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
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
        setFormData({ code: '', name: '', schedule: '', students: 0, allowedDomain: '', geofence: { enabled: false, latitude: 51.505, longitude: -0.09, radius: 50 } })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch(`${BASE_URL}/api/classes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    code: formData.code,
                    name: formData.name,
                    schedule: formData.schedule,
                    students: parseInt(formData.students) || 0,
                    allowedDomain: formData.allowedDomain,
                    geofence: formData.geofence
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


    const handleDeleteClass = async (classId) => {
        console.log('Delete button clicked for class ID:', classId)

        // Confirm before deleting
        if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            console.log('User cancelled deletion')
            return
        }

        console.log('User confirmed deletion, sending DELETE request...')

        try {
            const url = `${BASE_URL}/api/classes/${classId}`
            console.log('DELETE URL:', url)

            const token = localStorage.getItem('token')
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            console.log('Response status:', response.status)
            console.log('Response ok:', response.ok)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('Delete failed with error:', errorData)
                throw new Error('Failed to delete class')
            }

            const result = await response.json()
            console.log('Delete successful:', result)

            // Remove the class from local state
            setClasses(prev => prev.filter(cls => (cls._id || cls.id) !== classId))
            console.log('Class removed from UI')
        } catch (err) {
            console.error('Error deleting class:', err)
            alert('Failed to delete class. Make sure the backend server is running.')
        }
    }


    const handleOpenSettings = (cls) => {
        setEditClass(cls)
        setEditSettings({
            allowedDomain: cls.allowedDomain || '',
            geofence: { 
                enabled: cls.geofence?.enabled || false, 
                latitude: cls.geofence?.latitude || 51.505, 
                longitude: cls.geofence?.longitude || -0.09, 
                radius: cls.geofence?.radius || 50 
            }
        })
    }

    const handleSaveSettings = async (e) => {
        e.preventDefault()
        setSavingSettings(true)
        try {
            const classId = editClass._id || editClass.id;
            const response = await fetch(`${BASE_URL}/api/classes/${classId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(editSettings)
            })

            if (!response.ok) throw new Error('Failed to update settings')

            const updatedClass = await response.json()
            setClasses(prev => prev.map(c => (c._id || c.id) === classId ? updatedClass : c))
            setEditClass(null)
        } catch (err) {
            console.error('Error updating settings:', err)
            alert('Failed to update class configurations.')
        } finally {
            setSavingSettings(false)
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

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-outline" onClick={() => handleGenerateQR(cls._id || cls.id)} style={{ flex: 1 }}>
                                    <QrCode size={16} />
                                    QR
                                </button>
                                <button className="btn-outline" onClick={() => handleOpenSettings(cls)} style={{ flex: 1 }}>
                                    <Settings size={16} />
                                    Settings
                                </button>
                                <button
                                    className="btn-outline"
                                    onClick={() => handleDeleteClass(cls._id || cls.id)}
                                    style={{
                                        flex: 1,
                                        color: 'var(--danger, #dc2626)',
                                        borderColor: 'var(--danger, #dc2626)'
                                    }}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
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
                                <label htmlFor="code" className="form-label">Class Code</label>
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    className="form-input"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder="e.g., CS 101"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="name" className="form-label">Class Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Introduction to Programming"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="schedule" className="form-label">Schedule</label>
                                <input
                                    type="text"
                                    id="schedule"
                                    name="schedule"
                                    className="form-input"
                                    value={formData.schedule}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Mon, Wed, Fri 9:00 AM"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="students" className="form-label">Number of Students</label>
                                <input
                                    type="number"
                                    id="students"
                                    name="students"
                                    className="form-input"
                                    value={formData.students}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 30"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="allowedDomain" className="form-label">Allowed Email Domain (Optional)</label>
                                <input
                                    type="text"
                                    id="allowedDomain"
                                    name="allowedDomain"
                                    className="form-input"
                                    value={formData.allowedDomain}
                                    onChange={handleInputChange}
                                    placeholder="e.g., student.univ.edu"
                                />
                                <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                                    Only students with this email domain can mark attendance. Leave blank for no restriction.
                                </small>
                            </div>

                            <div className="form-group" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.geofence.enabled}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            if (isChecked && "geolocation" in navigator) {
                                                navigator.geolocation.getCurrentPosition(
                                                    (pos) => {
                                                        setFormData(p => ({...p, geofence: {...p.geofence, enabled: true, latitude: pos.coords.latitude, longitude: pos.coords.longitude}}));
                                                        setMapFlyTrigger(Date.now());
                                                    },
                                                    () => setFormData(p => ({...p, geofence: {...p.geofence, enabled: true}}))
                                                );
                                            } else {
                                                setFormData({ ...formData, geofence: { ...formData.geofence, enabled: isChecked } });
                                            }
                                        }}
                                        style={{ width: 'auto', margin: 0 }}
                                    />
                                    Enable Exact Location Geofencing
                                </label>
                                <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                                    If enabled, students must physically be within the designated radius below to check in.
                                </small>
                            </div>

                            {formData.geofence.enabled && (
                                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px dashed #d1d5db', marginTop: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Location Radius</span>
                                            <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{formData.geofence.radius} meters</span>
                                        </label>
                                        <input
                                            type="range"
                                            style={{ width: '100%', cursor: 'pointer', accentColor: '#16a34a' }}
                                            value={formData.geofence.radius}
                                            onChange={(e) => setFormData({ ...formData, geofence: { ...formData.geofence, radius: parseInt(e.target.value) || 50 } })}
                                            min="10"
                                            max="1000"
                                            step="10"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '8px' }}>
                                        <label className="form-label" style={{ margin: 0, flexShrink: 0 }}>Drop the Class Pin</label>
                                        <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'flex-end', marginLeft: '12px' }}>
                                            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                                                <input 
                                                    type="text" 
                                                    className="form-input" 
                                                    style={{ paddingRight: '32px', paddingLeft: '8px', paddingTop: '4px', paddingBottom: '4px', minHeight: '32px', height: '32px', fontSize: '0.875rem', width: '100%' }} 
                                                    placeholder="Search location..." 
                                                    value={mapSearchQuery}
                                                    onChange={e => { setMapSearchQuery(e.target.value); setShowResults(true); }}
                                                    onFocus={() => setShowResults(true)}
                                                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchLocation(false); } }}
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => handleSearchLocation(false)} 
                                                    style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                    disabled={isSearching}
                                                >
                                                    <Search size={16} color={isSearching ? "#9ca3af" : "#4b5563"} />
                                                </button>
                                                {showResults && searchResults.length > 0 && (
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px', zIndex: 1000, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                                        {searchResults.map((res, i) => (
                                                            <div 
                                                                key={i} 
                                                                onClick={() => handleSelectLocation(res, false)}
                                                                style={{ padding: '8px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: '0.8rem', color: '#374151', lineHeight: '1.2' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                            >
                                                                {res.display_name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button 
                                                type="button" 
                                                title="Get My Location"
                                                style={{ height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                                                onClick={() => {
                                                    if ("geolocation" in navigator) {
                                                        navigator.geolocation.getCurrentPosition((pos) => {
                                                            setFormData(p => ({...p, geofence: {...p.geofence, latitude: pos.coords.latitude, longitude: pos.coords.longitude}}));
                                                            setMapFlyTrigger(Date.now());
                                                        });
                                                    }
                                                }}
                                            >
                                                <LocateFixed size={18} color="#3b82f6" />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db', zIndex: 0 }}>
                                        <MapContainer 
                                            center={[formData.geofence.latitude, formData.geofence.longitude]} 
                                            zoom={15} 
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            />
                                            <LocationMarker 
                                                position={{ lat: formData.geofence.latitude, lng: formData.geofence.longitude }} 
                                                setPosition={(latlng) => setFormData({ ...formData, geofence: { ...formData.geofence, latitude: latlng.lat, longitude: latlng.lng } })}
                                            />
                                            <Circle 
                                                center={[formData.geofence.latitude, formData.geofence.longitude]}
                                                radius={formData.geofence.radius}
                                                pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.2 }}
                                            />
                                            <FlyToLocation coordinates={[formData.geofence.latitude, formData.geofence.longitude]} trigger={mapFlyTrigger} />
                                        </MapContainer>
                                    </div>
                                    <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>Click anywhere on the map to set the exact classroom center point.</small>
                                </div>
                            )}

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

            {/* Settings Modal */}
            {editClass && (
                <div className="modal-overlay" onClick={() => setEditClass(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
                        <div className="modal-header">
                            <h3>Configure: {editClass.name}</h3>
                            <button className="modal-close" onClick={() => setEditClass(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSettings}>
                            <div className="form-group">
                                <label className="form-label">Allowed Email Domain</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editSettings.allowedDomain}
                                    onChange={(e) => setEditSettings({ ...editSettings, allowedDomain: e.target.value })}
                                    placeholder="e.g., student.univ.edu"
                                />
                                <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>Optional security restriction.</small>
                            </div>

                            <div className="form-group" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={editSettings.geofence.enabled}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            // Auto-locate if it's the London default
                                            if (isChecked && "geolocation" in navigator && editSettings.geofence.latitude === 51.505) {
                                                navigator.geolocation.getCurrentPosition(
                                                    (pos) => {
                                                        setEditSettings(p => ({...p, geofence: {...p.geofence, enabled: true, latitude: pos.coords.latitude, longitude: pos.coords.longitude}}));
                                                        setMapFlyTrigger(Date.now());
                                                    },
                                                    () => setEditSettings(p => ({...p, geofence: {...p.geofence, enabled: true}}))
                                                );
                                            } else {
                                                setEditSettings({ ...editSettings, geofence: { ...editSettings.geofence, enabled: isChecked } });
                                            }
                                        }}
                                        style={{ width: 'auto', margin: 0 }}
                                    />
                                    Enable Exact Location Geofencing
                                </label>
                                <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                                    If enabled, students must physically be within the designated radius below to check in.
                                </small>
                            </div>

                            {editSettings.geofence.enabled && (
                                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px dashed #d1d5db', marginTop: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Location Radius</span>
                                            <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{editSettings.geofence.radius} meters</span>
                                        </label>
                                        <input
                                            type="range"
                                            style={{ width: '100%', cursor: 'pointer', accentColor: '#16a34a' }}
                                            value={editSettings.geofence.radius}
                                            onChange={(e) => setEditSettings({ ...editSettings, geofence: { ...editSettings.geofence, radius: parseInt(e.target.value) || 50 } })}
                                            min="10"
                                            max="1000"
                                            step="10"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '8px' }}>
                                        <label className="form-label" style={{ margin: 0, flexShrink: 0 }}>Drop the Class Pin</label>
                                        <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'flex-end', marginLeft: '12px' }}>
                                            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                                                <input 
                                                    type="text" 
                                                    className="form-input" 
                                                    style={{ paddingRight: '32px', paddingLeft: '8px', paddingTop: '4px', paddingBottom: '4px', minHeight: '32px', height: '32px', fontSize: '0.875rem', width: '100%' }} 
                                                    placeholder="Search location..." 
                                                    value={mapSearchQuery}
                                                    onChange={e => { setMapSearchQuery(e.target.value); setShowResults(true); }}
                                                    onFocus={() => setShowResults(true)}
                                                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchLocation(true); } }}
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => handleSearchLocation(true)} 
                                                    style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                    disabled={isSearching}
                                                >
                                                    <Search size={16} color={isSearching ? "#9ca3af" : "#4b5563"} />
                                                </button>
                                                {showResults && searchResults.length > 0 && (
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', marginTop: '4px', zIndex: 1000, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                                        {searchResults.map((res, i) => (
                                                            <div 
                                                                key={i} 
                                                                onClick={() => handleSelectLocation(res, true)}
                                                                style={{ padding: '8px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: '0.8rem', color: '#374151', lineHeight: '1.2' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                            >
                                                                {res.display_name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button 
                                                type="button" 
                                                title="Get My Location"
                                                style={{ height: '32px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                                                onClick={() => {
                                                    if ("geolocation" in navigator) {
                                                        navigator.geolocation.getCurrentPosition((pos) => {
                                                            setEditSettings(p => ({...p, geofence: {...p.geofence, latitude: pos.coords.latitude, longitude: pos.coords.longitude}}));
                                                            setMapFlyTrigger(Date.now());
                                                        });
                                                    }
                                                }}
                                            >
                                                <LocateFixed size={18} color="#3b82f6" />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db', zIndex: 0 }}>
                                        <MapContainer 
                                            center={[editSettings.geofence.latitude, editSettings.geofence.longitude]} 
                                            zoom={15} 
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            />
                                            <LocationMarker 
                                                position={{ lat: editSettings.geofence.latitude, lng: editSettings.geofence.longitude }} 
                                                setPosition={(latlng) => setEditSettings({ ...editSettings, geofence: { ...editSettings.geofence, latitude: latlng.lat, longitude: latlng.lng } })}
                                            />
                                            <Circle 
                                                center={[editSettings.geofence.latitude, editSettings.geofence.longitude]}
                                                radius={editSettings.geofence.radius}
                                                pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.2 }}
                                            />
                                            <FlyToLocation coordinates={[editSettings.geofence.latitude, editSettings.geofence.longitude]} trigger={mapFlyTrigger} />
                                        </MapContainer>
                                    </div>
                                    <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>Click anywhere on the map to set the exact classroom center point.</small>
                                </div>
                            )}

                            <div className="modal-actions" style={{ marginTop: '2rem' }}>
                                <button type="button" className="btn-outline" onClick={() => setEditClass(null)}>Cancel</button>
                                <button type="submit" className="btn-black" disabled={savingSettings}>
                                    {savingSettings ? 'Saving...' : 'Save Settings'}
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
