import React, { useState, useEffect } from 'react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUserPlus, faUser, faSearch, faUndo, faCheckCircle, 
    faSpinner, faArrowRight, faTimes, faIdCard, faWeight, faThermometerHalf 
} from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';

// --- Import Child Modals ---
import Booking from './Booking';
import Authorization from './Authorization';

export default function OpdCreate({ auth, treatmentPoints, billingGroups, doctors }) {
    
    // --- UI State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isRevisit, setIsRevisit] = useState(false);
    
    // --- Modal State ---
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // --- Form State ---
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        // Hidden Field for Revisit tracking
        existing_patient_code: '', 

        // Patient Details
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: '',
        date_of_birth: '',
        age: '', // Calculated field for display/input
        national_id: '',
        phone_number: '',
        
        // Visit Details (Filled in Booking Modal)
        treatmentpoint_id: '',
        doctor_user_id: '',
        billinggroup_id: '',
        
        // Insurance Details (From Authorization or Manual)
        billinggroupmembershipno: '', // Card No
        authorizationno: '',          // Auth No
        schemeid: '',                 // Scheme ID
        
        // Quick Vitals (Optional)
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

    // --- 2. AGE <-> DOB LOGIC ---
    const handleAgeChange = (e) => {
        const age = e.target.value;
        let newDob = data.date_of_birth;

        if (age && !isNaN(age)) {
            const today = new Date();
            const birthYear = today.getFullYear() - parseInt(age);
            const estimatedDob = new Date(birthYear, today.getMonth(), today.getDate());
            newDob = estimatedDob.toISOString().split('T')[0];
        } else if (age === '') {
            newDob = '';
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
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            newAge = age >= 0 ? age : 0;
        }
        setData(prev => ({ ...prev, date_of_birth: dob, age: newAge }));
    };

    // --- 3. PATIENT SELECTION (REVISIT) ---
    const selectPatient = (patient) => {
        clearErrors();
        setIsRevisit(true);
        setSearchQuery('');
        setSearchResults([]);

        // Calculate age for display
        const birthDate = new Date(patient.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

        setData(values => ({
            ...values,
            existing_patient_code: patient.code,
            first_name: patient.first_name,
            last_name: patient.last_name,
            middle_name: patient.middle_name || '',
            gender: patient.gender,
            date_of_birth: patient.date_of_birth,
            age: age,
            national_id: patient.national_id || '',
            phone_number: patient.phone_number || '',
        }));
    };

    const resetForm = () => {
        setIsRevisit(false);
        setSearchQuery('');
        reset(); 
    };

    // --- 4. AUTHORIZATION CALLBACK ---
    const handleAuthorizationSuccess = (authData) => {
        // Calculate age from API DOB if provided
        let apiAge = '';
        if (authData.patient_details.date_of_birth) {
            const birthDate = new Date(authData.patient_details.date_of_birth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            apiAge = age >= 0 ? age : 0;
        }

        setData(values => ({
            ...values,
            // Billing
            billinggroup_id: authData.billing_group_id,
            billinggroupmembershipno: authData.card_no,
            authorizationno: authData.authorization_no,
            schemeid: authData.scheme_id, // Map Scheme ID
            
            // Patient Info (Only fill if empty to allow corrections)
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

    // --- 5. SUBMISSION HANDLERS ---
    
    const handleNext = (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!data.first_name || !data.last_name || !data.gender || !data.date_of_birth) {
            alert("Please fill in all mandatory patient details.");
            return;
        }

        setShowBookingModal(true);
    };

    const confirmRegistration = () => {
        post(route('outpatient0.store'), {
            onSuccess: () => setShowBookingModal(false),
        });
    };

    return (
        <HospitalLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    <FontAwesomeIcon 
                        icon={isRevisit ? faCheckCircle : faUserPlus} 
                        className={`mr-2 ${isRevisit ? 'text-green-500' : 'text-gray-500'}`} 
                    />
                    {isRevisit ? 'Register Revisit' : 'New Patient Registration'}
                </h2>
            }
        >
            <Head title="Registration" />

            <div className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8">
                
                {/* --- SEARCH BAR --- */}
                <div className="bg-white shadow-sm rounded-lg mb-6 p-4 border-l-4 border-blue-500 relative z-20">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Search Existing Patient</label>
                        {isRevisit && (
                            <button onClick={resetForm} className="text-xs text-red-600 hover:text-red-800 font-semibold underline flex items-center">
                                <FontAwesomeIcon icon={faUndo} className="mr-1" /> Clear / Register New
                            </button>
                        )}
                    </div>
                    
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search by File No, Name, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isRevisit}
                        />
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            {isSearching ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSearch} />}
                        </span>
                    </div>

                    {/* Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto">
                            {searchResults.map((patient) => (
                                <div 
                                    key={patient.code}
                                    onClick={() => selectPatient(patient)}
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
                    
                    {/* --- INSURANCE AUTHORIZATION BUTTON --- */}
                    {!isRevisit && (
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

                    {/* --- SECTION 1: PATIENT DEMOGRAPHICS --- */}
                    <div className={`bg-white shadow-sm rounded-lg mb-6 transition-colors ${isRevisit ? 'bg-green-50 border border-green-200' : ''}`}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center">
                                <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" /> Patient Information
                            </h3>
                            {isRevisit && <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded">EXISTING PATIENT</span>}
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Surname */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                                <input
                                    type="text"
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                    required
                                    disabled={isRevisit}
                                />
                                {errors.last_name && <div className="text-red-500 text-xs mt-1">{errors.last_name}</div>}
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    value={data.first_name}
                                    onChange={e => setData('first_name', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                    required
                                    disabled={isRevisit}
                                />
                                {errors.first_name && <div className="text-red-500 text-xs mt-1">{errors.first_name}</div>}
                            </div>

                            {/* Middle Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                <input
                                    type="text"
                                    value={data.middle_name}
                                    onChange={e => setData('middle_name', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                    disabled={isRevisit}
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                <select
                                    value={data.gender}
                                    onChange={e => setData('gender', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                    required
                                    disabled={isRevisit}
                                >
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                {errors.gender && <div className="text-red-500 text-xs mt-1">{errors.gender}</div>}
                            </div>

                            {/* AGE & DOB ROW */}
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age (Years)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={data.age}
                                        onChange={handleAgeChange} 
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        placeholder="e.g. 25"
                                        disabled={isRevisit}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                                    <input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={handleDobChange} 
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        required
                                        disabled={isRevisit}
                                    />
                                    {errors.date_of_birth && <div className="text-red-500 text-xs mt-1">{errors.date_of_birth}</div>}
                                </div>
                            </div>

                            {/* National ID and Phone Number */}
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">National ID / Passport</label>
                                    <input
                                        type="text"
                                        value={data.national_id}
                                        onChange={e => setData('national_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        disabled={isRevisit}
                                    />
                                </div>                               
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={data.phone_number}
                                        onChange={e => setData('phone_number', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        required
                                        disabled={isRevisit}
                                    />
                                    {errors.phone_number && <div className="text-red-500 text-xs mt-1">{errors.phone_number}</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- SECTION 2: QUICK VITALS (OPTIONAL) --- */}
                    <div className="bg-white shadow-sm rounded-lg mb-6">
                        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Vitals (Optional)</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    <FontAwesomeIcon icon={faWeight} className="mr-1"/> Weight (kg)
                                </label>
                                <input
                                    type="number" step="0.1"
                                    value={data.weight}
                                    onChange={e => setData('weight', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    <FontAwesomeIcon icon={faThermometerHalf} className="mr-1"/> Temperature (°C)
                                </label>
                                <input
                                    type="number" step="0.1"
                                    value={data.temp}
                                    onChange={e => setData('temp', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                            {isRevisit ? 'Proceed to Booking' : 'Next: Visit Details'} <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
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
                />

            </div>
        </HospitalLayout>
    );
}