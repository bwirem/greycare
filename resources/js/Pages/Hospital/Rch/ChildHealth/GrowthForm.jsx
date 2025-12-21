import React, { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

export default function GrowthForm({ assessment = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        patient_code: assessment?.patient_code || '',
        age_months: assessment?.age_months || '',
        weight_for_age_status: assessment?.weight_for_age_status || 'Green',
        height_for_age_status: assessment?.height_for_age_status || '',
        feeding_practice: assessment?.feeding_practice || '',
        development_milestones: assessment?.development_milestones || '',
        vitamin_a_given: !!assessment?.vitamin_a_given,
        deworming_given: !!assessment?.deworming_given,
    });

    const [patientOptions, setPatientOptions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Initial load for Edit
    useEffect(() => {
        if (assessment && assessment.patient) {
            setSelectedPatient({
                value: assessment.patient_code,
                label: `${assessment.patient.first_name} ${assessment.patient.last_name}`
            });
        }
    }, [assessment]);

    const loadPatients = (inputValue) => {
        if (inputValue.length < 2) return;
        fetch(route('rch0.search', { query: inputValue }))
            .then(res => res.json())
            .then(json => {
                const options = json.map(p => ({
                    value: p.code,
                    label: `${p.first_name} ${p.last_name}`,
                    dob: p.date_of_birth // Pass DOB to calc age
                }));
                setPatientOptions(options);
            });
    };

    const handlePatientSelect = (opt) => {
        setSelectedPatient(opt);
        setData('patient_code', opt?.value);
        
        // Auto Calculate Age in Months if DOB is available
        if (opt && opt.dob) {
            const birthDate = new Date(opt.dob);
            const now = new Date();
            let months = (now.getFullYear() - birthDate.getFullYear()) * 12;
            months -= birthDate.getMonth();
            months += now.getMonth();
            setData('age_months', months <= 0 ? 0 : months);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (assessment) {
            put(route('rch3.update', assessment.id));
        } else {
            post(route('rch3.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Child *</label>
                <Select
                    options={patientOptions}
                    onInputChange={loadPatients}
                    onChange={handlePatientSelect}
                    value={selectedPatient}
                    isDisabled={!!assessment}
                    placeholder="Search Name..."
                    className="basic-single"
                />
                {errors.patient_code && <p className="text-red-500 text-xs mt-1">{errors.patient_code}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Age (Months) *</label>
                    <input type="number" value={data.age_months} onChange={e => setData('age_months', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required min="0" />
                    {errors.age_months && <p className="text-red-500 text-xs mt-1">{errors.age_months}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Weight for Age Status (Card Color) *</label>
                    <select value={data.weight_for_age_status} onChange={e => setData('weight_for_age_status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="Green">Green (Normal)</option>
                        <option value="Grey">Grey (Faltering / Moderate)</option>
                        <option value="Red">Red (Severe / Danger)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Feeding Practice</label>
                    <select value={data.feeding_practice} onChange={e => setData('feeding_practice', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">Select</option>
                        <option value="Exclusive Breastfeeding">Exclusive Breastfeeding</option>
                        <option value="Mixed Feeding">Mixed Feeding</option>
                        <option value="Complementary Feeding">Complementary Feeding</option>
                        <option value="Weaned">Weaned</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Milestones / Remarks</label>
                    <input type="text" value={data.development_milestones} onChange={e => setData('development_milestones', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g. Crawling, Walking..." />
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={data.vitamin_a_given} onChange={e => setData('vitamin_a_given', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Vitamin A Given?</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={data.deworming_given} onChange={e => setData('deworming_given', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Deworming Given?</span>
                </label>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('rch3.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {assessment ? 'Update Record' : 'Save Record'}
                </button>
            </div>
        </form>
    );
}