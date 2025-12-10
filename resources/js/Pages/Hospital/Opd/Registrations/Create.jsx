import React, { useState, useEffect } from 'react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSave, faTimes, faUserPlus, faUser, faFileInvoice, 
    faStethoscope, faSearch, faUndo, faCheckCircle, faSpinner 
} from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';

export default function OpdCreate({ auth, treatmentPoints, billingGroups, doctors }) {
    
    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isRevisit, setIsRevisit] = useState(false);

    // Form State
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        // Hidden Field for Revisit
        existing_patient_code: '', 

        // Patient Details
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: '',
        date_of_birth: '',
        national_id: '',
        
        // Visit Details
        treatmentpoint_id: '',
        doctor_user_id: '',
        
        // Billing Details
        billinggroup_id: '',
        schemeid: '',
        
        // Quick Vitals
        weight: '',
        temp: '',
    });

    // --- Search Logic ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 2) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 300); // Wait 300ms after typing stops

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const performSearch = async () => {
        setIsSearching(true);
        try {
            const response = await axios.get(route('outpatient0.search_patient'), {
                params: { query: searchQuery }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    // --- Select Patient (Revisit Mode) ---
    const selectPatient = (patient) => {
        clearErrors();
        setIsRevisit(true);
        setSearchQuery('');
        setSearchResults([]);

        // Populate Form
        setData(values => ({
            ...values,
            existing_patient_code: patient.code,
            first_name: patient.first_name,
            last_name: patient.last_name,
            middle_name: patient.middle_name || '',
            gender: patient.gender,
            date_of_birth: patient.date_of_birth,
            national_id: patient.national_id || '',
        }));
    };

    // --- Reset to New Patient Mode ---
    const resetForm = () => {
        setIsRevisit(false);
        setSearchQuery('');
        reset(); // Clears all fields
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('outpatient0.store'));
    };

    return (
        <HospitalLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    <FontAwesomeIcon icon={isRevisit ? faCheckCircle : faUserPlus} className={`mr-2 ${isRevisit ? 'text-green-500' : 'text-gray-500'}`} />
                    {isRevisit ? 'Register Revisit' : 'New Patient Registration'}
                </h2>
            }
        >
            <Head title="Registration" />

            <div className="max-w-7xl mx-auto py-2">
                
                {/* --- Search Bar --- */}
                <div className="bg-white shadow-sm rounded-lg mb-6 p-4 border-l-4 border-blue-500 relative">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">
                            Search Existing Patient (File No, Name, ID)
                        </label>
                        {isRevisit && (
                            <button 
                                onClick={resetForm}
                                className="text-xs text-red-600 hover:text-red-800 font-semibold underline flex items-center"
                            >
                                <FontAwesomeIcon icon={faUndo} className="mr-1" /> Clear / Register New
                            </button>
                        )}
                    </div>
                    
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isRevisit} // Disable search when patient selected
                        />
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            {isSearching ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSearch} />}
                        </span>
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mx-4">
                            {searchResults.map((patient) => (
                                <div 
                                    key={patient.code}
                                    onClick={() => selectPatient(patient)}
                                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-800">
                                            {patient.first_name} {patient.last_name}
                                        </span>
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                            {patient.code}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {patient.gender} | Born: {patient.date_of_birth} | ID: {patient.national_id}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form onSubmit={submit}>
                    
                    {/* --- Section 1: Patient Demographics --- */}
                    <div className={`bg-white shadow-sm rounded-lg mb-4 transition-colors ${isRevisit ? 'bg-green-50 border border-green-200' : ''}`}>
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
                                <h3 className="text-sm font-bold text-gray-700 uppercase">Patient Information</h3>
                            </div>
                            {isRevisit && <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded">EXISTING PATIENT</span>}
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Read-only logic: disabled={isRevisit} */}
                            
                            {/* Surname */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Surname *</label>
                                <input
                                    type="text"
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                                    required
                                    disabled={isRevisit}
                                />
                                {errors.last_name && <div className="text-red-500 text-xs mt-1">{errors.last_name}</div>}
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                                <input
                                    type="text"
                                    value={data.first_name}
                                    onChange={e => setData('first_name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                                    required
                                    disabled={isRevisit}
                                />
                                {errors.first_name && <div className="text-red-500 text-xs mt-1">{errors.first_name}</div>}
                            </div>

                            {/* Other Names */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Other Names</label>
                                <input
                                    type="text"
                                    value={data.middle_name}
                                    onChange={e => setData('middle_name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                                    disabled={isRevisit}
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                                <select
                                    value={data.gender}
                                    onChange={e => setData('gender', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                                    required
                                    disabled={isRevisit}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                {errors.gender && <div className="text-red-500 text-xs mt-1">{errors.gender}</div>}
                            </div>

                            {/* DOB */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                                <input
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={e => setData('date_of_birth', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                                    required
                                    disabled={isRevisit}
                                />
                                {errors.date_of_birth && <div className="text-red-500 text-xs mt-1">{errors.date_of_birth}</div>}
                            </div>

                            {/* National ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">National ID / Passport</label>
                                <input
                                    type="text"
                                    value={data.national_id}
                                    onChange={e => setData('national_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                                    disabled={isRevisit}
                                />
                                {errors.national_id && <div className="text-red-500 text-xs mt-1">{errors.national_id}</div>}
                            </div>
                        </div>
                    </div>

                    {/* --- Section 2: Visit & Billing (Always Editable) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        
                        {/* Visit Details */}
                        <div className="bg-white shadow-sm rounded-lg">
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center">
                                <FontAwesomeIcon icon={faStethoscope} className="text-green-500 mr-2" />
                                <h3 className="text-sm font-bold text-gray-700 uppercase">Visit Details</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Treatment Point / Clinic *</label>
                                    <select
                                        value={data.treatmentpoint_id}
                                        onChange={e => setData('treatmentpoint_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select Clinic</option>
                                        {treatmentPoints.map(tp => (
                                            <option key={tp.id} value={tp.id}>{tp.name}</option>
                                        ))}
                                    </select>
                                    {errors.treatmentpoint_id && <div className="text-red-500 text-xs mt-1">{errors.treatmentpoint_id}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assign Doctor (Optional)</label>
                                    <select
                                        value={data.doctor_user_id}
                                        onChange={e => setData('doctor_user_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    >
                                        <option value="">Any Available Doctor</option>
                                        {doctors.map(doc => (
                                            <option key={doc.id} value={doc.id}>{doc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Billing Details */}
                        <div className="bg-white shadow-sm rounded-lg">
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center">
                                <FontAwesomeIcon icon={faFileInvoice} className="text-purple-500 mr-2" />
                                <h3 className="text-sm font-bold text-gray-700 uppercase">Billing Information</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Payment Mode / Group *</label>
                                    <select
                                        value={data.billinggroup_id}
                                        onChange={e => setData('billinggroup_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select Payment Mode</option>
                                        {billingGroups.map(bg => (
                                            <option key={bg.id} value={bg.id}>{bg.name}</option>
                                        ))}
                                    </select>
                                    {errors.billinggroup_id && <div className="text-red-500 text-xs mt-1">{errors.billinggroup_id}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Member No / Scheme ID</label>
                                    <input
                                        type="text"
                                        value={data.schemeid}
                                        onChange={e => setData('schemeid', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="If Insurance/Corporate"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Quick Vitals (Optional) --- */}
                    <div className="bg-white shadow-sm rounded-lg mb-4">
                        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-xs font-bold text-gray-500 uppercase">Quick Vitals (Optional)</h3>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Weight (kg)</label>
                                <input
                                    type="number" step="0.1"
                                    value={data.weight}
                                    onChange={e => setData('weight', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Temperature (°C)</label>
                                <input
                                    type="number" step="0.1"
                                    value={data.temp}
                                    onChange={e => setData('temp', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- Action Buttons --- */}
                    <div className="flex justify-end gap-3 mt-6 pb-6">
                        <Link
                            href={route('outpatient0.index')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none transition ease-in-out duration-150"
                        >
                            <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cancel
                        </Link>
                        
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <FontAwesomeIcon icon={faSave} className="mr-2" /> 
                            {processing ? 'Registering...' : (isRevisit ? 'Register Revisit' : 'Complete Registration')}
                        </button>
                    </div>

                    {/* Global Errors */}
                    {errors.error && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                            {errors.error}
                        </div>
                    )}
                </form>
            </div>
        </HospitalLayout>
    );
}