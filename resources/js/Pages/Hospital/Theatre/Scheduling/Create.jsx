import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faSave, faTimes, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Add default_date to props
export default function SchedulingCreate({ procedures, doctors, anesthetists, theatres, booking = null, default_date }) {
    
    // Determine if we are Editing or Creating
    const isEditMode = !!booking;

    const { data, setData, post, put, processing, errors } = useForm({
        patient_code: booking?.patientcode || '',
        procedure_id: booking?.theatre_procedure_id || '',
        doctor_id: booking?.doctor_user_id || '',
        anesthetist_id: booking?.anesthetist_user_id || '',
        theatre_id: booking?.theatre_id || '', 
        
        // CLEANER LOGIC: Use the pre-formatted string from Laravel
        // If editing: use booking.scheduled_at_formatted
        // If creating: use default_date (Server "Now")
        scheduled_at: booking?.scheduled_at_formatted || default_date,
        
        send_to_theatre: false 
    });

    const submit = (e) => {
        e.preventDefault();
        
        if (isEditMode) {
            put(route('theatre1.update', booking.id));
        } else {
            post(route('theatre1.store'));
        }
    };

    return (
        <HospitalLayout header={<h2>{isEditMode ? 'Reschedule Surgery' : 'Schedule Major Surgery'}</h2>}>
            <Head title={isEditMode ? "Edit Schedule" : "Schedule Surgery"} />

            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    <form onSubmit={submit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Patient Code */}
                            <div>
                                <InputLabel value="Patient Code" />
                                <TextInput 
                                    className={`w-full mt-1 ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    value={data.patient_code}
                                    onChange={e => setData('patient_code', e.target.value)}
                                    readOnly={isEditMode} 
                                    placeholder="e.g. PAT-26..."
                                    required
                                />
                                {errors.patient_code && <div className="text-red-500 text-sm mt-1">{errors.patient_code}</div>}
                                
                                {isEditMode && booking?.patient && (
                                    <div className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faUserCheck} />
                                        <span className="font-bold">Patient:</span> 
                                        {booking.patient.first_name} {booking.patient.last_name}
                                    </div>
                                )}
                            </div>

                            {/* Procedure */}
                            <div>
                                <InputLabel value="Procedure" />
                                <select 
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.procedure_id}
                                    onChange={e => setData('procedure_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select Procedure...</option>
                                    {procedures.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} {p.group?.is_major ? '(Major)' : '(Minor)'}
                                        </option>
                                    ))}
                                </select>
                                {errors.procedure_id && <div className="text-red-500 text-sm mt-1">{errors.procedure_id}</div>}
                            </div>

                            {/* Surgeon */}
                            <div>
                                <InputLabel value="Surgeon" />
                                <select 
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.doctor_id}
                                    onChange={e => setData('doctor_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select Surgeon...</option>
                                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                {errors.doctor_id && <div className="text-red-500 text-sm mt-1">{errors.doctor_id}</div>}
                            </div>

                            {/* Anesthetist */}
                            <div>
                                <InputLabel value="Anesthetist (Optional)" />
                                <select 
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.anesthetist_id}
                                    onChange={e => setData('anesthetist_id', e.target.value)}
                                >
                                    <option value="">Select Anesthetist...</option>
                                    {anesthetists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>

                            {/* Theatre Room */}
                            <div>
                                <InputLabel value="Theatre Room" />
                                <select 
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.theatre_id}
                                    onChange={e => setData('theatre_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select Theatre Room...</option>
                                    {theatres.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} {t.type ? `(${t.type})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.theatre_id && <div className="text-red-500 text-sm mt-1">{errors.theatre_id}</div>}
                            </div>

                            {/* Date Time */}
                            <div>
                                <InputLabel value="Scheduled Date & Time" />
                                <TextInput 
                                    type="datetime-local"
                                    className="w-full mt-1"
                                    value={data.scheduled_at}
                                    onChange={e => setData('scheduled_at', e.target.value)}
                                    required
                                />
                                {errors.scheduled_at && <div className="text-red-500 text-sm mt-1">{errors.scheduled_at}</div>}
                            </div>
                        </div>

                        {/* --- SEND TO THEATRE CHECKBOX --- */}
                        <div className="mt-6 bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-start gap-3">
                            <div className="flex items-center h-5">
                                <input
                                    id="send_to_theatre"
                                    type="checkbox"
                                    className="focus:ring-orange-500 h-5 w-5 text-orange-600 border-gray-300 rounded cursor-pointer"
                                    checked={data.send_to_theatre}
                                    onChange={(e) => setData('send_to_theatre', e.target.checked)}
                                />
                            </div>
                            <div className="text-sm">
                                <label htmlFor="send_to_theatre" className="font-bold text-gray-800 cursor-pointer">
                                    Admit to Theatre Immediately?
                                </label>
                                <p className="text-gray-600 mt-1">
                                    Checking this will move the patient directly to the <strong>Intra-operative / Surgery In-Progress</strong> list and remove them from the Schedule list.
                                </p>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                            <Link href={route('theatre1.index')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm font-bold flex items-center gap-2">
                                <FontAwesomeIcon icon={faTimes} /> Cancel
                            </Link>
                            
                            <PrimaryButton 
                                disabled={processing} 
                                className={`flex items-center gap-2 transition-colors ${data.send_to_theatre ? 'bg-orange-600 hover:bg-orange-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                <FontAwesomeIcon icon={data.send_to_theatre ? faArrowRight : faSave} />
                                {data.send_to_theatre ? 'Confirm & Send to Theatre' : (isEditMode ? 'Update Schedule' : 'Confirm Booking')}
                            </PrimaryButton>
                        </div>

                    </form>
                </div>
            </div>
        </HospitalLayout>
    );
}