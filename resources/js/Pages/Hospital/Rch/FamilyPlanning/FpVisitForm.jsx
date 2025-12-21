import React, { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

export default function FpVisitForm({ visit = null, methods }) {
    const { data, setData, post, put, processing, errors } = useForm({
        patient_code: visit?.patient_code || '',
        visit_date: visit?.visit_date || new Date().toISOString().split('T')[0],
        method_id: visit?.method_id || '',
        weight_kg: visit?.weight_kg || '',
        bp_systolic: visit?.bp_systolic || '',
        bp_diastolic: visit?.bp_diastolic || '',
        quantity: visit?.quantity || 1,
        side_effects: visit?.side_effects || '',
        next_appointment_date: visit?.next_appointment_date || '',
    });

    const [patientOptions, setPatientOptions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        if (visit && visit.patient) {
            setSelectedPatient({
                value: visit.patient_code,
                label: `${visit.patient.first_name} ${visit.patient.last_name} (${visit.patient_code})`
            });
        }
    }, [visit]);

    const loadPatients = (inputValue) => {
        if (inputValue.length < 2) return;
        fetch(route('rch0.search', { query: inputValue }))
            .then(res => res.json())
            .then(json => {
                const options = json.map(p => ({
                    value: p.code,
                    label: `${p.first_name} ${p.last_name} (${p.code}) - ${p.phone_number || ''}`
                }));
                setPatientOptions(options);
            });
    };

    const submit = (e) => {
        e.preventDefault();
        if (visit) {
            put(route('rch0.update', visit.id));
        } else {
            post(route('rch0.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Search *</label>
                <Select
                    options={patientOptions}
                    onInputChange={(val) => loadPatients(val)}
                    onChange={(opt) => {
                        setSelectedPatient(opt);
                        setData('patient_code', opt?.value);
                    }}
                    value={selectedPatient}
                    isDisabled={!!visit}
                    placeholder="Type Name or File Number..."
                    isClearable
                    className="basic-single"
                />
                {errors.patient_code && <p className="text-red-500 text-xs mt-1">{errors.patient_code}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Visit Date *</label>
                    <input 
                        type="date" 
                        value={data.visit_date} 
                        onChange={e => setData('visit_date', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                        required 
                    />
                    {errors.visit_date && <p className="text-red-500 text-xs mt-1">{errors.visit_date}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Method Dispensed *</label>
                    <select 
                        value={data.method_id} 
                        onChange={e => setData('method_id', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    >
                        <option value="">-- Select Method --</option>
                        {methods.map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                        ))}
                    </select>
                    {errors.method_id && <p className="text-red-500 text-xs mt-1">{errors.method_id}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input 
                        type="number" 
                        value={data.quantity} 
                        onChange={e => setData('quantity', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                        min="1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (KG)</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        value={data.weight_kg} 
                        onChange={e => setData('weight_kg', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Systolic</label>
                        <input type="text" value={data.bp_systolic} onChange={e => setData('bp_systolic', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="120" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Diastolic</label>
                        <input type="text" value={data.bp_diastolic} onChange={e => setData('bp_diastolic', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="80" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Next Appointment *</label>
                    <input 
                        type="date" 
                        value={data.next_appointment_date} 
                        onChange={e => setData('next_appointment_date', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Complaints / Side Effects</label>
                <textarea 
                    value={data.side_effects} 
                    onChange={e => setData('side_effects', e.target.value)} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                    rows="3"
                ></textarea>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('rch0.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {visit ? 'Update Record' : 'Save Record'}
                </button>
            </div>
        </form>
    );
}