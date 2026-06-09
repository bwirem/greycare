import React, { useEffect } from 'react'; 
import HospitalLayout from '@/Layouts/HospitalLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSave, faTimes, faUserEdit, faUser, faFileInvoice, 
    faStethoscope, faIdCard, faCheck, faHashtag 
} from "@fortawesome/free-solid-svg-icons";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OpdEdit({ auth, booking, treatmentPoints, billingGroups, billingSubgroups = [], doctors }) {
    
    // Helper to calculate age from DOB
    const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : 0;
    };

    // Initialize Form State
    const { data, setData, put, processing, errors } = useForm({
        // Patient Details
        first_name: booking.patient?.first_name || '',
        last_name: booking.patient?.last_name || '',
        middle_name: booking.patient?.middle_name || '',
        address: booking.patient?.address || '',
        contact: booking.patient?.phone_number || '', // Added Phone Field
        
        // Date of Birth & Age
        date_of_birth: booking.patient?.date_of_birth || '',
        age: calculateAge(booking.patient?.date_of_birth),
        
        // Visit Details
        treatmentpoint_id: booking.treatmentpoint_id || '',
        doctor_user_id: booking.doctor_user_id || '',
        
        // Billing Details
        billinggroup_id: booking.billinggroup_id || '',
        billingsubgroup_id: booking.billingsubgroup_id || '',
        billinggroupmembershipno: booking.billinggroupmembershipno || '',
        authorizationno: booking.authorizationno || '',
        schemeid: booking.schemeid || '',
    });

    // --- 1. Determine Selected Group & Payment Category Logic ---
    const selectedGroup = billingGroups.find(bg => bg.id == data.billinggroup_id);
    
    const showSubgroups = selectedGroup 
        ? (selectedGroup.hassubgroups == 1 || selectedGroup.hassubgroups === true) 
        : false;
    
    // Default to 'Cash' (True) until proven otherwise by flags
    let isCash = true; 
    if (selectedGroup) {
        const isExemption = (selectedGroup.isexemption == 1 || selectedGroup.isexemption === true);
        const isInsurance = (selectedGroup.isinsurance == 1 || selectedGroup.isinsurance === true);

        if (isExemption || isInsurance) {
            isCash = false;
        }
    }

    // --- 2. Handlers ---
    const handleGroupChange = (e) => {
        const newGroupId = e.target.value;
        const newGroup = billingGroups.find(bg => bg.id == newGroupId);
        const groupHasSub = newGroup ? (newGroup.hassubgroups == 1 || newGroup.hassubgroups === true) : false;
        
        setData(prev => ({
            ...prev,
            billinggroup_id: newGroupId,
            billingsubgroup_id: groupHasSub ? prev.billingsubgroup_id : ''
        }));
    };

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
        const newAge = calculateAge(dob);
        setData(prev => ({ ...prev, date_of_birth: dob, age: newAge }));
    };

    // const submit = (e) => {
    //     e.preventDefault();
    //     put(route('outpatient0.update', booking.id));
    // };

    const submit = (e) => {
        e.preventDefault();
        
        // CHANGE THIS LINE: Point it to the new dedicated registration update route
        put(route('outpatient0.registration.update', booking.id), {
            transform: (data) => ({
                ...data,
                doctor_user_id: data.doctor_user_id ? data.doctor_user_id : null,
                billingsubgroup_id: data.billingsubgroup_id ? data.billingsubgroup_id : null,
            }),
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Registration Updated!");
            },
            onError: (err) => {
                console.error("Validation Errors:", err);
                if (err.error) toast.error(err.error);
            }
        });
    };

    return (
        <HospitalLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    <FontAwesomeIcon icon={faUserEdit} className="mr-2 text-blue-500" />
                    Edit Registration: <span className="font-mono text-gray-600">{booking.visit_number}</span>
                </h2>
            }
        >
            <Head title="Edit Registration" />

            <div className="max-w-7xl mx-auto py-2">
                <form onSubmit={submit}>
                    
                    {/* --- Section 1: Patient Demographics --- */}
                    <div className="bg-white shadow-sm rounded-lg mb-4">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
                                <h3 className="text-sm font-bold text-gray-700 uppercase">Patient Information</h3>
                            </div>
                            <span className="text-xs font-mono text-gray-500">File No: {booking.patientcode}</span>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Surname */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Surname *</label>
                                <input
                                    type="text"
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>

                            {/* Age & DOB */}
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Age (Years)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={data.age}
                                        onChange={handleAgeChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                                    <input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={handleDobChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                    />
                                    {errors.date_of_birth && <div className="text-red-500 text-xs mt-1">{errors.date_of_birth}</div>}
                                </div>
                            </div>

                            {/* Gender (Read Only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Gender</label>
                                <input
                                    type="text"
                                    value={booking.patient?.gender || ''}
                                    disabled
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed"
                                />
                            </div>
                             
                            {/* Phone / Contact */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="text"
                                    value={data.contact}
                                    onChange={e => setData('contact', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {errors.contact && <div className="text-red-500 text-xs mt-1">{errors.contact}</div>}
                            </div> 

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>                        
                        </div>
                    </div>

                    {/* --- Section 2: Visit Details --- */}
                    <div className="bg-white shadow-sm rounded-lg mb-4">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center">
                            <FontAwesomeIcon icon={faStethoscope} className="text-green-500 mr-2" />
                            <h3 className="text-sm font-bold text-gray-700 uppercase">Visit Details</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <label className="block text-sm font-medium text-gray-700">Assign Doctor</label>
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

                    {/* --- Section 3: Billing Information --- */}
                    <div className="bg-white shadow-sm rounded-lg mb-4">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center">
                            <FontAwesomeIcon icon={faFileInvoice} className="text-purple-500 mr-2" />
                            <h3 className="text-sm font-bold text-gray-700 uppercase">Billing Information</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Payment Mode */}
                                <div className={showSubgroups ? "col-span-1" : "col-span-1 md:col-span-2"}>
                                    <label className="block text-sm font-medium text-gray-700">Payment Mode / Group *</label>
                                    <select
                                        value={data.billinggroup_id}
                                        onChange={handleGroupChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select Payment Mode</option>
                                        {billingGroups.map(bg => (
                                            <option key={bg.id} value={bg.id}>{bg.name}</option>
                                        ))}
                                    </select>
                                    {errors.billinggroup_id && <div className="text-red-500 text-xs mt-1">{errors.billinggroup_id}</div>}
                                </div>

                                {/* Billing Subgroup & Staff Card Number */}
                                {showSubgroups && (
                                    <>
                                        <div className="col-span-1 animate-fade-in">
                                            <label className="block text-sm font-medium text-gray-700">Billing Subgroup *</label>
                                            <select
                                                value={data.billingsubgroup_id} 
                                                onChange={e => setData('billingsubgroup_id', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                                required={showSubgroups}
                                            >
                                                <option value="">Select Subgroup...</option>
                                                {billingSubgroups.map(bs => (
                                                    <option key={bs.id} value={bs.id}>{bs.name}</option>
                                                ))}
                                            </select>
                                            {errors.billingsubgroup_id && <div className="text-red-500 text-xs mt-1">{errors.billingsubgroup_id}</div>}
                                        </div>

                                        {isCash && (
                                            <div className="col-span-1 md:col-span-2 animate-fade-in">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <FontAwesomeIcon icon={faIdCard} className="mr-1 text-purple-500"/> Card / Member Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.billinggroupmembershipno}
                                                    onChange={e => setData('billinggroupmembershipno', e.target.value)}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                                    placeholder="N/A"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Insurance Fields */}
                            {!isCash && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100 animate-fade-in">
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <FontAwesomeIcon icon={faIdCard} className="mr-1 text-purple-500"/> Card Number
                                        </label>
                                        <input
                                            type="text"
                                            value={data.billinggroupmembershipno}
                                            onChange={e => setData('billinggroupmembershipno', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                            placeholder="N/A"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <FontAwesomeIcon icon={faCheck} className="mr-1 text-purple-500"/> Auth Number
                                        </label>
                                        <input
                                            type="text"
                                            value={data.authorizationno}
                                            onChange={e => setData('authorizationno', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                            placeholder="N/A"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <FontAwesomeIcon icon={faHashtag} className="mr-1 text-purple-500"/> Scheme / Product ID
                                        </label>
                                        <input
                                            type="text"
                                            value={data.schemeid}
                                            onChange={e => setData('schemeid', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                            placeholder="N/A"
                                        />
                                    </div>

                                </div>
                            )}

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
                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <FontAwesomeIcon icon={faSave} className="mr-2" /> 
                            {processing ? 'Saving...' : 'Update Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </HospitalLayout>
    );
}