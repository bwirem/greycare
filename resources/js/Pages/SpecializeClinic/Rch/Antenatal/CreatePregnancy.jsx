import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faUserPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

export default function CreatePregnancy({ auth }) {
    // Initialize form with new patient fields
    const { data, setData, post, processing, errors, reset } = useForm({
        is_new_patient: false,
        
        // Existing Patient Field
        patient_code: '',

        // New Patient Fields
        first_name: '',
        middle_name: '',
        last_name: '',
        phone_number: '',
        date_of_birth: '',
        
        // Pregnancy Fields
        anc_number: '',
        gravida: '',
        parity: '',
        lmp_date: '',
    });

    const [patientOptions, setPatientOptions] = useState([]);
    const [edd, setEdd] = useState('');

    // Toggle Mode
    const toggleMode = (isNew) => {
        // Reset patient specific fields when switching modes
        setData(prev => ({
            ...prev,
            is_new_patient: isNew,
            patient_code: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            phone_number: '',
            date_of_birth: ''
        }));
    };

    const loadPatients = (inputValue) => {
        if (inputValue.length < 2) return;
        fetch(route('rch0.search', { query: inputValue }))
            .then(res => res.json())
            .then(json => {
                const options = json.map(p => ({
                    value: p.code,
                    label: `${p.first_name} ${p.last_name} (${p.code})`
                }));
                setPatientOptions(options);
            });
    };

    // Auto-calculate EDD
    const handleLmpChange = (date) => {
        setData('lmp_date', date);
        if (date) {
            const lmp = new Date(date);
            lmp.setDate(lmp.getDate() + 7); // +7 Days
            lmp.setMonth(lmp.getMonth() + 9); // +9 Months
            setEdd(lmp.toISOString().split('T')[0]);
        } else {
            setEdd('');
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('rch1.register.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Register New Pregnancy</h2>}
        >
            <Head title="ANC Registration" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Mode Toggle Buttons */}
                        <div className="flex space-x-4 mb-8 border-b pb-4">
                            <button
                                type="button"
                                onClick={() => toggleMode(false)}
                                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    !data.is_new_patient 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                                Search Existing Patient
                            </button>

                            <button
                                type="button"
                                onClick={() => toggleMode(true)}
                                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    data.is_new_patient 
                                    ? 'bg-green-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                                Create New Patient
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* --- CONDITIONAL SECTION: PATIENT IDENTITY --- */}
                            
                            {!data.is_new_patient ? (
                                /* Option A: Search Existing */
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Existing Patient *</label>
                                    <Select
                                        options={patientOptions}
                                        onInputChange={loadPatients}
                                        onChange={(opt) => setData('patient_code', opt?.value)}
                                        placeholder="Type Name or File No..."
                                        className="basic-single"
                                        isClearable
                                    />
                                    {errors.patient_code && <p className="text-red-500 text-xs mt-1">{errors.patient_code}</p>}
                                </div>
                            ) : (
                                /* Option B: New Patient Form */
                                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                                    <h3 className="text-green-800 font-bold mb-4 text-sm uppercase">New Patient Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">First Name *</label>
                                            <input type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                                            <input type="text" value={data.middle_name} onChange={e => setData('middle_name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                                            <input type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                                            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                                            <input type="text" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                                            {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                                            <input type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" required max={new Date().toISOString().split('T')[0]} />
                                            {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-500 italic ml-1">Gender set to Female automatically</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- PREGNANCY DETAILS (COMMON) --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Facility ANC Number</label>
                                    <input type="text" value={data.anc_number} onChange={e => setData('anc_number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g. ANC/2025/001" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Menstrual Period (LMP) *</label>
                                    <input type="date" value={data.lmp_date} onChange={e => handleLmpChange(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                                    {edd && <p className="text-xs text-green-600 mt-1 font-bold">Estimated Delivery: {edd}</p>}
                                    {errors.lmp_date && <p className="text-red-500 text-xs mt-1">{errors.lmp_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gravida (Total Pregnancies) *</label>
                                    <input type="number" value={data.gravida} onChange={e => setData('gravida', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required min="1" />
                                    {errors.gravida && <p className="text-red-500 text-xs mt-1">{errors.gravida}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Parity (Previous Births) *</label>
                                    <input type="number" value={data.parity} onChange={e => setData('parity', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required min="0" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 border-t pt-4">
                                <Link href={route('rch1.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                                    {data.is_new_patient ? 'Register Patient & Pregnancy' : 'Register Pregnancy'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}