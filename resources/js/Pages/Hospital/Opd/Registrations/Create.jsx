import React, { useState, useEffect } from 'react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUserPlus, faUser, faSearch, faUndo, faArrowRight, 
    faTimes, faIdCard, faSpinner, faPhone, faStethoscope 
} from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';

// --- Import Child Modals ---
import Booking from './Booking';
import Authorization from './Authorization';

export default function OpdCreate({ 
    auth, 
    treatmentPoints, 
    billingGroups, 
    doctors, 
    defaultCashGroupId 
}) {
    
    // --- UI State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Modes: 'new' (Default) vs 'existing'
    const [mode, setMode] = useState('new');
    const [selectedPatient, setSelectedPatient] = useState(null);
    
    // --- Modal State ---
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // --- Form State ---
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        // Patient Identity
        existing_patient_code: '', 
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: '',
        date_of_birth: '',
        age: '', 
        national_id: '',
        phone_number: '',
        address: '',

        // Visit Details
        // --- MODIFICATION START: Get default from Session Storage ---
        treatmentpoint_id: (typeof window !== 'undefined' ? sessionStorage.getItem('opd_selected_point') : '') || '',
        // --- MODIFICATION END ---
        
        doctor_user_id: '',
        billinggroup_id: '',
        
        // Insurance Details
        billinggroupmembershipno: '', 
        authorizationno: '',          
        schemeid: '',                 
        
        // Quick Vitals
        weight: '',
        temp: '',
    });

    // --- 1. SEARCH LOGIC ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 2) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);
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

    // --- 2. SELECTION HANDLERS ---
    const handleSelectExisting = (pt) => {
        // Calculate age
        const birthDate = new Date(pt.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        pt.age = age;

        setSelectedPatient(pt);
        setData(values => ({
            ...values,
            existing_patient_code: pt.code,
            first_name: pt.first_name,
            last_name: pt.last_name,
            middle_name: pt.middle_name || '',
            gender: pt.gender,
            date_of_birth: pt.date_of_birth,
            age: age,
            national_id: pt.national_id || '',
            phone_number: pt.phone_number || '',
        }));

        setMode('existing');
        setSearchResults([]);
        setSearchQuery('');
        clearErrors();
    };

    const handleReset = () => {
        setMode('new');
        setSelectedPatient(null);
        setSearchQuery('');
        reset(); 
        
        // Optional: Re-apply the default treatment point after reset
        const defaultPoint = sessionStorage.getItem('opd_selected_point') || '';
        if(defaultPoint) setData('treatmentpoint_id', defaultPoint);
    };

    // --- 3. AGE <-> DOB LOGIC ---
    const handleAgeChange = (e) => {
        const age = e.target.value;
        let newDob = data.date_of_birth;
        if (age && !isNaN(age)) {
            const today = new Date();
            const birthYear = today.getFullYear() - parseInt(age);
            const estimatedDob = new Date(birthYear, today.getMonth(), today.getDate());
            newDob = estimatedDob.toISOString().split('T')[0];
        }
        setData(prev => ({ ...prev, age: age, date_of_birth: newDob }));
    };

    const handleDobChange = (e) => {
        const dob = e.target.value;
        let newAge = data.age;
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
                age--;
            }
            newAge = age >= 0 ? age : 0;
        }
        setData(prev => ({ ...prev, date_of_birth: dob, age: newAge }));
    };

    // --- 4. AUTHORIZATION CALLBACK ---
    const handleAuthorizationSuccess = (authData) => {
        let apiAge = '';
        if (authData.patient_details.date_of_birth) {
            const birthDate = new Date(authData.patient_details.date_of_birth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            apiAge = age >= 0 ? age : 0;
        }

        if(mode === 'search') setMode('new');

        setData(values => ({
            ...values,
            existing_patient_code: authData.existing_patient_code, 

            billinggroup_id: authData.billing_group_id,
            billinggroupmembershipno: authData.card_no,
            authorizationno: authData.authorization_no,
            schemeid: authData.scheme_id,
            
            first_name: values.first_name || authData.patient_details.first_name,
            last_name: values.last_name || authData.patient_details.last_name,
            middle_name: values.middle_name || authData.patient_details.middle_name,
            gender: values.gender || authData.patient_details.gender,
            date_of_birth: values.date_of_birth || authData.patient_details.date_of_birth,
            age: values.age || apiAge,
            national_id: values.national_id || authData.patient_details.national_id,
            phone_number: values.phone_number || authData.patient_details.phone_number
        }));
    };

    // --- 5. SUBMISSION ---
    const handleNext = (e) => {
        e.preventDefault();
        
        if (mode === 'new') {
            if (!data.first_name || !data.last_name || !data.gender || !data.date_of_birth) {
                alert("Please fill in all mandatory patient details.");
                return;
            }
        }
        setShowBookingModal(true);
    };

    const confirmRegistration = () => {
        post(route('outpatient0.store'), {
            onSuccess: () => setShowBookingModal(false),
        });
    };

    return (
        <HospitalLayout header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                <FontAwesomeIcon icon={faStethoscope} className="mr-2 text-blue-500" />
                New OPD Registration
            </h2>
        }>
            <Head title="Registration" />

            <div className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8">
                
                {/* --- A. SEARCH BAR --- */}
                <div className="bg-white shadow-sm rounded-lg mb-6 p-4 border-l-4 border-blue-500 relative z-20">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Search Existing Patient</label>
                        {(mode === 'existing' || data.first_name) && (
                            <button onClick={handleReset} className="text-xs text-red-600 hover:text-red-800 font-semibold underline flex items-center">
                                <FontAwesomeIcon icon={faUndo} className="mr-1" /> Clear / New Patient
                            </button>
                        )}
                    </div>
                    
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                            placeholder="Search by File No, Name, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            {isSearching ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSearch} />}
                        </span>
                    </div>

                    {/* Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto z-50">
                            {searchResults.map((patient) => (
                                <div 
                                    key={patient.code}
                                    onClick={() => handleSelectExisting(patient)}
                                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 group"
                                >
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-800 group-hover:text-blue-700">
                                            {patient.first_name} {patient.last_name}
                                        </span>
                                        <span className="text-xs font-mono bg-gray-100 group-hover:bg-white px-2 py-1 rounded text-gray-600">
                                            {patient.code}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {patient.gender} | Born: {patient.date_of_birth} | ID: {patient.national_id || 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form onSubmit={handleNext}>
                    
                    {/* --- INSURANCE AUTHORIZATION BUTTON (Only for New/Manual) --- */}
                    {mode === 'new' && (
                        <div className="flex justify-end mb-4">
                            <button 
                                type="button"
                                onClick={() => setShowAuthModal(true)}
                                className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded shadow-sm border border-indigo-200 hover:bg-indigo-100 font-bold text-sm flex items-center gap-2 transition-colors"
                            >
                                <FontAwesomeIcon icon={faIdCard} /> Verify Insurance / Get Authorization
                            </button>
                        </div>
                    )}

                    {/* --- B. PATIENT DEMOGRAPHICS --- */}
                    {mode === 'existing' && selectedPatient ? (
                        // READ ONLY CARD
                        <div className="bg-white shadow-sm rounded-lg mb-6 border-l-4 border-green-500 p-6 flex items-center gap-6 animate-fade-in-down">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {selectedPatient.first_name} {selectedPatient.last_name} {selectedPatient.middle_name}
                                </h3>
                                <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-4">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono font-bold text-gray-700 border">
                                        {selectedPatient.code}
                                    </span>
                                    <span>{selectedPatient.gender}</span>
                                    <span>{selectedPatient.age} Years</span>
                                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faIdCard} className="text-gray-400"/> {selectedPatient.national_id || 'N/A'}</span>
                                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faPhone} className="text-gray-400"/> {selectedPatient.phone_number || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="ml-auto hidden sm:block">
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Existing Patient
                                </span>
                            </div>
                        </div>
                    ) : (
                        // EDITABLE FORM
                        <div className="bg-white shadow-sm rounded-lg mb-6 transition-colors bg-blue-50 border border-blue-200">
                            <div className="px-6 py-4 border-b border-blue-200 flex items-center justify-between bg-blue-100 rounded-t-lg">
                                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide flex items-center">
                                    <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> New Patient Registration
                                </h3>
                                <span className="text-xs font-bold text-blue-700 bg-white px-2 py-1 rounded border border-blue-200">NEW ENTRY</span>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <InputLabel value="Surname *" className="mb-1" />
                                    <TextInput
                                        value={data.last_name}
                                        onChange={e => setData('last_name', e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                    {errors.last_name && <div className="text-red-500 text-xs mt-1">{errors.last_name}</div>}
                                </div>

                                <div>
                                    <InputLabel value="First Name *" className="mb-1" />
                                    <TextInput
                                        value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                    {errors.first_name && <div className="text-red-500 text-xs mt-1">{errors.first_name}</div>}
                                </div>

                                <div>
                                    <InputLabel value="Middle Name" className="mb-1" />
                                    <TextInput
                                        value={data.middle_name}
                                        onChange={e => setData('middle_name', e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Gender *" className="mb-1" />
                                    <select
                                        value={data.gender}
                                        onChange={e => setData('gender', e.target.value)}
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    {errors.gender && <div className="text-red-500 text-xs mt-1">{errors.gender}</div>}
                                </div>

                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Age (Years)" className="mb-1" />
                                        <TextInput
                                            type="number"
                                            min="0"
                                            max="120"
                                            value={data.age}
                                            onChange={handleAgeChange} 
                                            className="w-full"
                                            placeholder="e.g. 25"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Date of Birth *" className="mb-1" />
                                        <TextInput
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={handleDobChange} 
                                            className="w-full"
                                            required
                                        />
                                        {errors.date_of_birth && <div className="text-red-500 text-xs mt-1">{errors.date_of_birth}</div>}
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="National ID / Passport" className="mb-1" />
                                        <TextInput
                                            value={data.national_id}
                                            onChange={e => setData('national_id', e.target.value)}
                                            className="w-full"
                                        />
                                    </div>                               
                                    <div>
                                        <InputLabel value="Phone Number" className="mb-1" />
                                        <TextInput
                                            value={data.phone_number}
                                            onChange={e => setData('phone_number', e.target.value)}
                                            className="w-full"
                                            required
                                        />
                                        {errors.phone_number && <div className="text-red-500 text-xs mt-1">{errors.phone_number}</div>}
                                    </div>
                                    <div>
                                        <InputLabel value="Address" className="mb-1" />
                                        <TextInput
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            className="w-full"
                                        />
                                    </div> 
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- C. QUICK VITALS (Keep in Parent for OPD) --- */}
                    <div className="bg-white shadow-sm rounded-lg mb-6">
                        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Vitals (Optional)</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <InputLabel value="Weight (kg)" className="mb-1" />
                                <TextInput
                                    type="number" step="0.1"
                                    value={data.weight}
                                    onChange={e => setData('weight', e.target.value)}
                                    className="w-full"
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <InputLabel value="Temp (°C)" className="mb-1" />
                                <TextInput
                                    type="number" step="0.1"
                                    value={data.temp}
                                    onChange={e => setData('temp', e.target.value)}
                                    className="w-full"
                                    placeholder="0.0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex justify-end gap-4">
                        <Link
                            href={route('outpatient0.index')}
                            className="inline-flex items-center px-4 py-3 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50"
                        >
                            <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cancel
                        </Link>
                        
                        <button
                            type="submit"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-md font-bold text-sm text-white uppercase tracking-widest shadow-lg hover:bg-blue-700 transition ease-in-out duration-150"
                        >
                            Next: Visit Details <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                        </button>
                    </div>

                </form>

                {/* --- MODALS --- */}
                
                {/* 1. Authorization Modal */}
                <Authorization 
                    show={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    onAuthorized={handleAuthorizationSuccess}
                    billingGroups={billingGroups}
                />

                {/* 2. Booking Modal */}
                <Booking 
                    show={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    onConfirm={confirmRegistration}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    treatmentPoints={treatmentPoints}
                    billingGroups={billingGroups}
                    doctors={doctors}
                    defaultCashGroupId={defaultCashGroupId} // PASS PROP
                />

            </div>
        </HospitalLayout>
    );
}