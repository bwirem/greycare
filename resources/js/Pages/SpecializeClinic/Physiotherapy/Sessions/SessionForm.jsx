import React, { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

export default function SessionForm({ session = null, treatmentTypes }) {
    // Initial treatments extraction for Edit mode
    const initialTreatments = session?.treatments?.map(t => t.treatment_type_id) || [];

    const { data, setData, post, put, processing, errors } = useForm({
        patient_code: session?.patient_code || '',
        session_start: session?.session_start || new Date().toISOString().slice(0, 16),
        session_end: session?.session_end || '',
        aims_of_therapy: session?.aims_of_therapy || '',
        therapist_feedback: session?.therapist_feedback || '',
        treatments: initialTreatments
    });

    const [patientOptions, setPatientOptions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Load patient data if editing
    useEffect(() => {
        if (session && session.patient) {
            setSelectedPatient({
                value: session.patient_code,
                label: `${session.patient.first_name} ${session.patient.last_name} (${session.patient_code})`
            });
        }
    }, [session]);

    const loadPatients = (inputValue) => {
        if (inputValue.length < 2) return;
        fetch(route('physiotherapy0.search', { query: inputValue }))
            .then(res => res.json())
            .then(json => {
                const options = json.map(p => ({
                    value: p.code,
                    label: `${p.first_name} ${p.last_name} (${p.code})`
                }));
                setPatientOptions(options);
            });
    };

    // Handle Checkbox Toggle
    const handleTreatmentToggle = (id) => {
        let newTreatments = [...data.treatments];
        if (newTreatments.includes(id)) {
            newTreatments = newTreatments.filter(t => t !== id);
        } else {
            newTreatments.push(id);
        }
        setData('treatments', newTreatments);
    };

    const submit = (e) => {
        e.preventDefault();
        if (session) {
            put(route('physiotherapy0.update', session.id));
        } else {
            post(route('physiotherapy0.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            
            {/* Patient & Time Section */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient *</label>
                        <Select
                            options={patientOptions}
                            onInputChange={loadPatients}
                            onChange={(opt) => {
                                setSelectedPatient(opt);
                                setData('patient_code', opt?.value);
                            }}
                            value={selectedPatient}
                            isDisabled={!!session}
                            placeholder="Search Name or File No..."
                        />
                        {errors.patient_code && <p className="text-red-500 text-xs mt-1">{errors.patient_code}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Session Start Time *</label>
                        <input 
                            type="datetime-local" 
                            value={data.session_start} 
                            onChange={e => setData('session_start', e.target.value)} 
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                            required 
                        />
                        {errors.session_start && <p className="text-red-500 text-xs mt-1">{errors.session_start}</p>}
                    </div>
                </div>
            </div>

            {/* Aims & Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Aims of Therapy</label>
                    <textarea 
                        value={data.aims_of_therapy} 
                        onChange={e => setData('aims_of_therapy', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                        rows="4"
                        placeholder="e.g. Reduce pain, improve mobility..."
                    ></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Therapist Feedback / Progress</label>
                    <textarea 
                        value={data.therapist_feedback} 
                        onChange={e => setData('therapist_feedback', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                        rows="4"
                        placeholder="Observations during session..."
                    ></textarea>
                </div>
            </div>

            {/* Treatments Selection Grid */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Treatments Performed</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {treatmentTypes.map((type) => (
                        <div 
                            key={type.id} 
                            className={`border rounded-lg p-3 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 transition-colors ${data.treatments.includes(type.id) ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}`}
                            onClick={() => handleTreatmentToggle(type.id)}
                        >
                            <input
                                type="checkbox"
                                checked={data.treatments.includes(type.id)}
                                onChange={() => {}} // Handled by div click
                                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div>
                                <label className="text-sm font-medium text-gray-700 cursor-pointer">{type.name}</label>
                                {type.code && <p className="text-xs text-gray-500">{type.code}</p>}
                            </div>
                        </div>
                    ))}
                </div>
                {errors.treatments && <p className="text-red-500 text-xs mt-1">{errors.treatments}</p>}
            </div>

            {/* Close Session (Edit Only) */}
            {session && (
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                    <label className="block text-sm font-medium text-yellow-800">Session End Time (Close Session)</label>
                    <input 
                        type="datetime-local" 
                        value={data.session_end || ''} 
                        onChange={e => setData('session_end', e.target.value)} 
                        className="mt-1 block w-full md:w-1/2 rounded-md border-gray-300 shadow-sm" 
                    />
                    <p className="text-xs text-yellow-600 mt-1">Set this to mark the session as completed.</p>
                </div>
            )}

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('physiotherapy0.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {session ? 'Update Session' : 'Start Session'}
                </button>
            </div>
        </form>
    );
}