import React, { useState, useMemo } from 'react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from '@/Components/Modal'; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faPlus, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios'; 

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function AppointmentIndex({ events, clinics, doctors }) {
    
    // --- FIX: Convert String Dates to JS Date Objects ---
    const parsedEvents = useMemo(() => {
        return events.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
        }));
    }, [events]);
    // ----------------------------------------------------

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [patientSearch, setPatientSearch] = useState('');
    const [patientResults, setPatientResults] = useState([]);

    const { data, setData, post, processing, reset, errors } = useForm({
        patient_code: '',
        patient_name: '',
        clinic_id: '',
        doctor_user_id: '',
        appointment_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        reason: ''
    });

    // Helpers
    const handleSelectSlot = ({ start }) => {
        // format needs a valid date object, 'start' from slot is already a Date object
        setData('appointment_date', format(start, 'yyyy-MM-dd'));
        setShowCreateModal(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
    };

    const searchPatients = async (query) => {
        setPatientSearch(query);
        if(query.length > 2) {
            const res = await axios.get(route('outpatient0.search_patient'), { params: { query } });
            setPatientResults(res.data);
        }
    };

    const selectPatient = (p) => {
        setData(d => ({ ...d, patient_code: p.code, patient_name: `${p.firstname} ${p.surname}` }));
        setPatientResults([]);
        setPatientSearch(`${p.firstname} ${p.surname}`);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('outpatient1.store'), {
            onSuccess: () => { setShowCreateModal(false); reset(); }
        });
    };

    const handleCheckIn = () => {
        if(!selectedEvent) return;
        router.post(route('outpatient1.checkin', selectedEvent.id), {}, {
            onSuccess: () => setSelectedEvent(null)
        });
    };

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3174ad'; 
        if (event.status === 'Completed') backgroundColor = '#10B981';
        if (event.status === 'Cancelled') backgroundColor = '#EF4444'; 
        return { style: { backgroundColor } };
    };

    return (
        <HospitalLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    <FontAwesomeIcon icon={faCalendarCheck} className="mr-2 text-blue-500" />
                    Appointment Scheduler
                </h2>
            }
        >
            <Head title="Appointments" />

            <div className="py-2 h-[calc(100vh-150px)] flex flex-col">
                <div className="mb-4 flex justify-end">
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" /> New Appointment
                    </button>
                </div>

                <div className="flex-1 bg-white p-4 rounded shadow text-sm">
                    <Calendar
                        localizer={localizer}
                        events={parsedEvents} // <--- Pass the parsed events here
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        selectable
                        eventPropGetter={eventStyleGetter}
                    />
                </div>

                {/* Create Modal */}
                <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4">Schedule Appointment</h2>
                        
                        {/* Patient Search */}
                        <div className="mb-4 relative">
                            <label className="block text-sm font-medium text-gray-700">Patient</label>
                            <input 
                                type="text" 
                                className="w-full border rounded p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" 
                                placeholder="Search Name/File No..."
                                value={patientSearch}
                                onChange={e => searchPatients(e.target.value)}
                            />
                            {patientResults.length > 0 && (
                                <div className="absolute z-50 bg-white border shadow-lg w-full max-h-40 overflow-y-auto mt-1 rounded">
                                    {patientResults.map(p => (
                                        <div key={p.code} onClick={() => selectPatient(p)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-0">
                                            <span className="font-bold">{p.firstname} {p.surname}</span> <span className="text-gray-500">({p.code})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.patient_code && <div className="text-red-500 text-xs mt-1">{errors.patient_code}</div>}
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input 
                                    type="date" 
                                    className="w-full border rounded p-2 mt-1"
                                    value={data.appointment_date}
                                    onChange={e => setData('appointment_date', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Time</label>
                                <input 
                                    type="time" 
                                    className="w-full border rounded p-2 mt-1"
                                    value={data.start_time}
                                    onChange={e => setData('start_time', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Clinic</label>
                                <select 
                                    className="w-full border rounded p-2 mt-1"
                                    value={data.clinic_id}
                                    onChange={e => setData('clinic_id', e.target.value)}
                                >
                                    <option value="">Select Clinic</option>
                                    {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.clinic_id && <div className="text-red-500 text-xs mt-1">{errors.clinic_id}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Doctor</label>
                                <select 
                                    className="w-full border rounded p-2 mt-1"
                                    value={data.doctor_user_id}
                                    onChange={e => setData('doctor_user_id', e.target.value)}
                                >
                                    <option value="">Any Doctor</option>
                                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 px-4 py-2 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={submitCreate} disabled={processing} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Schedule</button>
                        </div>
                    </div>
                </Modal>

                {/* View Detail Modal */}
                <Modal show={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
                    {selectedEvent && (
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedEvent.title}</h2>
                                    <p className="text-sm text-gray-500">File No: {selectedEvent.resource.patientcode}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold text-white ${selectedEvent.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`}>
                                    {selectedEvent.status}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded mb-6 text-sm text-gray-700 border border-gray-200">
                                <p className="mb-2"><strong>Clinic:</strong> {selectedEvent.clinic || 'N/A'}</p>
                                <p className="mb-2"><strong>Doctor:</strong> {selectedEvent.doctor || 'Unassigned'}</p>
                                <p><strong>Time:</strong> {format(selectedEvent.start, 'PPpp')}</p> {/* Use Date object directly */}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button 
                                    onClick={() => setSelectedEvent(null)} 
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
                                >
                                    Close
                                </button>
                                
                                {selectedEvent.status === 'Pending' && (
                                    <button 
                                        onClick={handleCheckIn}
                                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center hover:bg-green-700 shadow transition"
                                    >
                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> 
                                        Check In (Send to Triage)
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>

            </div>
        </HospitalLayout>
    );
}