import React, { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faUserPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { toast } from 'react-toastify';

export default function GrowthForm({ assessment = null }) {
    const { data, setData, post, put, processing, errors, clearErrors, reset } = useForm({
        is_new_patient: false,
        patient_code: assessment?.patient_code || '',
        
        first_name: '', last_name: '', middle_name: '',
        gender: 'Male', date_of_birth: '', guardian_phone: '',

        weight: assessment?.vitals?.weight || '', 
        height: assessment?.vitals?.height || '',

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
    const [isNewPatient, setIsNewPatient] = useState(false);

    // --- 1. NEW: Initialize Selected Patient on Edit ---
    useEffect(() => {
        if (assessment && assessment.patient) {
            setSelectedPatient({
                value: assessment.patient_code,
                label: `${assessment.patient.first_name} ${assessment.patient.last_name} (${assessment.patient_code})`
            });
        }
    }, [assessment]);

    // --- 2. Calculate Age Helper ---
    const calculateAgeInMonths = (dateString) => {
        if (!dateString) return '';
        const birthDate = new Date(dateString);
        const today = new Date();
        if (isNaN(birthDate.getTime())) return '';
        let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
        months -= birthDate.getMonth();
        months += today.getMonth();
        return months < 0 ? 0 : months;
    };

    // --- 3. Watch DOB for New Patients ---
    useEffect(() => {
        if (isNewPatient && data.date_of_birth) {
            const calculatedAge = calculateAgeInMonths(data.date_of_birth);
            if (data.age_months !== calculatedAge) {
                setData(prevData => ({ ...prevData, age_months: calculatedAge }));
            }
        }
    }, [data.date_of_birth, isNewPatient]); 

    // --- 4. Search Function ---
    const loadPatients = (inputValue) => {
        if (inputValue.length < 2) return;
        fetch(route('rch0.search', { query: inputValue }))
            .then(res => res.json())
            .then(json => {
                const options = json.map(p => ({
                    value: p.code,
                    label: `${p.first_name} ${p.last_name} (${p.code})`,
                    dob: p.date_of_birth
                }));
                setPatientOptions(options);
            });
    };

    const handlePatientSelect = (opt) => {
        setSelectedPatient(opt);
        const age = opt?.dob ? calculateAgeInMonths(opt.dob) : '';
        setData(prev => ({
            ...prev,
            patient_code: opt?.value,
            age_months: age
        }));
    };

    const toggleMode = () => {
        setIsNewPatient(!isNewPatient);
        clearErrors();
        setData(prev => ({ 
            ...prev, 
            is_new_patient: !isNewPatient, 
            patient_code: '',
            first_name: '',
            last_name: '',
            date_of_birth: '',
            age_months: ''
        }));
        setSelectedPatient(null);
    };

    const submit = (e) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                toast.success(assessment ? 'Record updated successfully!' : 'Record saved successfully!');
                if (!assessment) {
                    reset();
                    setSelectedPatient(null);
                }
            },
            onError: () => toast.error('Please check the form for errors.')
        };

        if (assessment) {
            put(route('rch3.update', assessment.id), options);
        } else {
            post(route('rch3.store'), options);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            
            <div className="bg-blue-50 p-5 rounded-md border border-blue-200">
                 <div className="flex justify-between mb-4 items-center">
                    <h3 className="font-bold text-blue-800 text-lg">
                        {isNewPatient ? 'New Child Registration' : 'Find Existing Child'}
                    </h3>
                    {/* Hide Toggle Button if Editing */}
                    {!assessment && (
                        <button type="button" onClick={toggleMode} className="text-sm font-semibold text-blue-600 underline hover:text-blue-800">
                             {isNewPatient ? 'Search Existing Instead' : 'Register New Instead'}
                        </button>
                    )}
                </div>

                {!isNewPatient ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Name or Code</label>
                        <Select 
                            options={patientOptions} 
                            onInputChange={loadPatients} 
                            onChange={handlePatientSelect} 
                            value={selectedPatient} 
                            isDisabled={!!assessment} // This locks it in Edit mode
                            placeholder={assessment ? "Loading patient..." : "Type to search..."} 
                            className="basic-single"
                        />
                         {errors.patient_code && <p className="text-red-500 text-xs mt-1">{errors.patient_code}</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* New Patient Inputs ... (Same as before) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name *</label>
                            <input type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                            <input type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gender *</label>
                            <select value={data.gender} onChange={e => setData('gender', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                            <input 
                                type="date" 
                                value={data.date_of_birth} 
                                max={new Date().toISOString().split("T")[0]}
                                onChange={e => setData('date_of_birth', e.target.value)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                required 
                            />
                            {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Guardian Phone</label>
                            <input type="text" value={data.guardian_phone} onChange={e => setData('guardian_phone', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                    </div>
                )}
            </div>

            {/* Rest of the form (Vitals, Assessment, Buttons) remains exactly the same */}
            <div className="p-4 bg-white rounded-md border border-gray-200 shadow-sm">
                <h3 className="text-md font-bold text-gray-800 mb-4 border-b pb-2">Measurements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (kg) *</label>
                        <input type="number" step="0.1" value={data.weight} onChange={e => setData('weight', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                        {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                        <input type="number" step="0.1" value={data.height} onChange={e => setData('height', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                         {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Age (Months)</label>
                        <input type="number" value={data.age_months} onChange={e => setData('age_months', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed" readOnly />
                    </div>
                </div>

                <h3 className="text-md font-bold text-gray-800 mb-4 border-b pb-2">Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Growth Status (Card Color) *</label>
                        <select value={data.weight_for_age_status} onChange={e => setData('weight_for_age_status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="Green">Green (Normal)</option>
                            <option value="Grey">Grey (Moderate)</option>
                            <option value="Red">Red (Severe)</option>
                        </select>
                        {errors.weight_for_age_status && <p className="text-red-500 text-xs mt-1">{errors.weight_for_age_status}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Feeding Practice</label>
                        <select value={data.feeding_practice} onChange={e => setData('feeding_practice', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="">Select...</option>
                            <option value="Exclusive Breastfeeding">Exclusive Breastfeeding</option>
                            <option value="Mixed Feeding">Mixed Feeding</option>
                            <option value="Complementary Feeding">Complementary Feeding</option>
                            <option value="Weaned">Weaned</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Milestones / Remarks</label>
                        <textarea rows="2" value={data.development_milestones} onChange={e => setData('development_milestones', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                </div>
                
                <div className="mt-6 flex gap-6">
                     <label className="flex items-center gap-2"><input type="checkbox" checked={data.vitamin_a_given} onChange={e => setData('vitamin_a_given', e.target.checked)} /> Vitamin A</label>
                     <label className="flex items-center gap-2"><input type="checkbox" checked={data.deworming_given} onChange={e => setData('deworming_given', e.target.checked)} /> Deworming</label>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Link href={route('rch3.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-md">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {assessment ? 'Update Record' : 'Save Record'}
                </button>
            </div>
        </form>
    );
}