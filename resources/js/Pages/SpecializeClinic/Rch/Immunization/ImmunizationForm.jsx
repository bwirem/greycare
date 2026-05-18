import React, { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

export default function ImmunizationForm({ record = null, vaccines }) {
    const { data, setData, post, put, processing, errors } = useForm({
        patient_code: record?.patient_code || '',
        vaccine_id: record?.vaccine_id || '',
        administered_date: record?.administered_date || new Date().toISOString().split('T')[0],
        batch_number: record?.batch_number || '',
        remarks: record?.remarks || ''
    });

    const [patientOptions, setPatientOptions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        if (record && record.patient) {
            setSelectedPatient({
                value: record.patient_code,
                label: `${record.patient.first_name} ${record.patient.last_name} (${record.patient_code})`
            });
        }
    }, [record]);

    const loadPatients = (inputValue) => {
        if (inputValue.length < 2) return;
        fetch(route('rch0.search', { query: inputValue })) // Reuse the search from RCH 0
            .then(res => res.json())
            .then(json => {
                const options = json.map(p => ({
                    value: p.code,
                    label: `${p.first_name} ${p.last_name} (${p.code})`
                }));
                setPatientOptions(options);
            });
    };

    const submit = (e) => {
        e.preventDefault();
        if (record) {
            put(route('rch4.update', record.id));
        } else {
            post(route('rch4.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Child *</label>
                <Select
                    options={patientOptions}
                    onInputChange={loadPatients}
                    onChange={(opt) => {
                        setSelectedPatient(opt);
                        setData('patient_code', opt?.value);
                    }}
                    value={selectedPatient}
                    isDisabled={!!record}
                    placeholder="Search Name or File No..."
                    className="basic-single"
                />
                {errors.patient_code && <p className="text-red-500 text-xs mt-1">{errors.patient_code}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date Administered *</label>
                    <input type="date" value={data.administered_date} onChange={e => setData('administered_date', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    {errors.administered_date && <p className="text-red-500 text-xs mt-1">{errors.administered_date}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Vaccine *</label>
                    <select value={data.vaccine_id} onChange={e => setData('vaccine_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                        <option value="">-- Select Vaccine --</option>
                        {vaccines.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.name} ({v.code}) 
                                {v.target_age_weeks !== null ? ` - Due: ${v.target_age_weeks} weeks` : ''}
                            </option>
                        ))}
                    </select>
                    {errors.vaccine_id && <p className="text-red-500 text-xs mt-1">{errors.vaccine_id}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                    <input type="text" value={data.batch_number} onChange={e => setData('batch_number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g. BN12345" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Remarks / Reaction</label>
                    <input type="text" value={data.remarks} onChange={e => setData('remarks', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Optional notes" />
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('rch4.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded">Cancel</Link>
                <button disabled={processing} className="bg-green-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-green-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {record ? 'Update Record' : 'Save Record'}
                </button>
            </div>
        </form>
    );
}