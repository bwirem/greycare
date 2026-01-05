import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, faUser, faUserPlus, faSpinner, 
    faUndo, faArrowRight, faPhone, faIdCard, faBed, faTimes
} from '@fortawesome/free-solid-svg-icons';

// --- Import Child Modals ---
import Admit from './Admit';
import Authorization from './Authorization';

export default function Create({ patient, wards, pendingAdmission, billingGroups , defaultCashGroupId}) {
    
    // --- Helper: Get Local Date Time for Input ---
    const getCurrentLocalTime = () => {
        const now = new Date();
        // Adjust for timezone offset to get local string in ISO format
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    // --- UI State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Modes: 'new' (Default - Blank Form), 'existing' (Selected Patient Card)
    const [mode, setMode] = useState(patient || pendingAdmission ? 'existing' : 'new');
    
    // Store selected patient object
    const [selectedPatient, setSelectedPatient] = useState(patient || null);
    
    // --- Modal State ---
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // --- Main Form State ---
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
        // 1. Admission Details (Managed in Admit Modal)
        pending_admission_id: pendingAdmission?.id || '',
        ward_id: pendingAdmission?.ward_id || '',
        room_id: '',
        bed_id: '',
        
        // FIXED: Use Local Time for new admissions
        admission_date: pendingAdmission?.admission_date 
            ? new Date(pendingAdmission.admission_date).toISOString().slice(0, 16) 
            : getCurrentLocalTime(),

        // 2. Patient Identity
        patient_code: patient?.code || '', 

        // 3. Demographics
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: '',
        date_of_birth: '',
        age: '', 
        national_id: '',
        phone_number: '',

        // 4. Billing & Insurance
        billinggroup_id: pendingAdmission?.billinggroup_id ||'',
        billinggroupmembershipno: pendingAdmission?.billinggroupmembershipno ||'', 
        authorizationno: pendingAdmission?.authorizationno ||'',          
        schemeid: pendingAdmission?.schemeid ||'',                 
    });

    // --- 1. Search Logic ---
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

    // --- 2. Selection & Reset Handlers ---

    const handleSelectExisting = (pt) => {
        const birthDate = new Date(pt.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
            age--;
        }
        pt.age = age;

        setSelectedPatient(pt);
        
        setData(prev => ({ 
            ...prev, 
            patient_code: pt.code,
            first_name: pt.first_name,
            last_name: pt.last_name,
            gender: pt.gender,
            date_of_birth: pt.date_of_birth,
            age: age
        }));

        setMode('existing');
        setSearchResults([]);
        setSearchQuery('');
        clearErrors();
    };

    const handleReset = () => {
        if (!pendingAdmission) {
            setMode('new');
            setSelectedPatient(null);
            setSearchQuery('');
            reset(); 
            // Reset date to current time explicitly after form reset
            setData('admission_date', getCurrentLocalTime());
        }
    };

    // --- 3. Authorization Callback ---
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
            // --- SET THE CODE (Empty or Found Value) ---
            patient_code: authData.existing_patient_code, 
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

    // --- 4. Age/DOB Calculator ---
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

    // --- 5. Submit ---
    const handleNext = (e) => {
        e.preventDefault();
        
        if (mode === 'new') {
            if (!data.first_name || !data.last_name || !data.gender || !data.date_of_birth) {
                alert("Please fill in all mandatory patient fields.");
                return;
            }
        }
        setShowAdmitModal(true);
    };

    const confirmAdmission = () => {
        post(route('inpatient0.store'), {
            onSuccess: () => setShowAdmitModal(false),
        });
    };

    return (
        <HospitalLayout header={
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                <FontAwesomeIcon icon={faBed} className="mr-2 text-blue-600" />
                {pendingAdmission ? 'Process Pending Admission' : 'New Admission Entry'}
            </h2>
        }>
            <Head title="Admit Patient" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
                
                {/* --- A. SEARCH BAR --- */}
                {!pendingAdmission && (
                    <div className="bg-white shadow-sm rounded-lg mb-6 p-4 border-l-4 border-blue-500 relative z-20">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-gray-700">Search Existing Patient (or fill form below)</label>
                            
                            {(mode === 'existing' || data.first_name) && (
                                <button 
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs text-red-600 hover:text-red-800 font-semibold underline flex items-center"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="mr-1" /> Clear / New Patient
                                </button>
                            )}
                        </div>
                        
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                                placeholder="Enter Name, File Number, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                {isSearching ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSearch} />}
                            </span>
                        </div>
                        
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto z-50">
                                {searchResults.map((pt) => (
                                    <div 
                                        key={pt.code}
                                        onClick={() => handleSelectExisting(pt)}
                                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 group"
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-bold text-gray-800 group-hover:text-blue-700">
                                                {pt.first_name} {pt.last_name}
                                            </span>
                                            <span className="text-xs font-mono bg-gray-100 group-hover:bg-white px-2 py-1 rounded text-gray-600">
                                                {pt.code}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {pt.gender} | {pt.date_of_birth} | {pt.phone_number}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleNext}>

                    {/* --- INSURANCE AUTHORIZATION BUTTON --- */}
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

                    {/* --- PATIENT INFO --- */}
                    {mode === 'existing' && selectedPatient ? (
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
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex justify-end gap-4 mt-8 border-t pt-4">
                        <Link
                            href={route('inpatient0.index')}
                            className="inline-flex items-center px-4 py-3 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50"
                        >
                            <FontAwesomeIcon icon={faUndo} className="mr-2" /> Cancel
                        </Link>
                        
                        <button
                            type="submit"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-md font-bold text-sm text-white uppercase tracking-widest shadow-lg hover:bg-blue-700 transition ease-in-out duration-150"
                        >
                            Next: Assign Bed <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                        </button>
                    </div>
                </form>

                {/* --- MODAL 1: AUTHORIZATION --- */}
                <Authorization 
                    show={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    onAuthorized={handleAuthorizationSuccess}
                    billingGroups={billingGroups}
                />

                {/* --- MODAL 2: ADMISSION DETAILS --- */}
                <Admit 
                    show={showAdmitModal}
                    onClose={() => setShowAdmitModal(false)}
                    onConfirm={confirmAdmission}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    wards={wards}
                    billingGroups={billingGroups}
                    defaultCashGroupId={defaultCashGroupId}
                    pendingAdmission={pendingAdmission}
                />

            </div>
        </HospitalLayout>
    );
}