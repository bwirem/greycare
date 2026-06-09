import React from 'react';
import Modal from '@/Components/Modal'; 
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faStethoscope, faCheck, faTimes, 
    faIdCard, faHashtag, faSpinner 
} from "@fortawesome/free-solid-svg-icons";

export default function Booking({ 
    show, 
    onClose, 
    onConfirm, 
    data, 
    setData, 
    errors, 
    treatmentPoints = [], 
    billingGroups = [], 
    billingSubgroups = [], 
    doctors = [], 
    processing,
    defaultCashGroupId = null
}) {
    
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
        
        // If Facility has a default cash group, and this group is NOT it, it might be an Invoice/Company
        const isInvoice = defaultCashGroupId && selectedGroup.id != defaultCashGroupId;

        if (isExemption || isInsurance || isInvoice) {
            isCash = false;
        }
    }

    // --- 2. Auth Link Check ---
    const isAuthLinked = data.authorizationno && data.authorizationno.length > 0;

    // --- 3. Handlers ---
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

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                
                {/* --- Header --- */}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        Confirm Visit Details
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    
                    {/* --- 1. Patient Summary (Read Only) --- */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="block font-bold text-lg text-blue-900">
                                    {data.first_name} {data.middle_name} {data.last_name}
                                </span>
                                <span className="text-sm text-blue-700">
                                    {data.gender}, {data.age} Years
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs font-bold text-blue-400 uppercase">File Number</span>
                                <span className="font-mono text-blue-800">
                                    {data.existing_patient_code || 'NEW'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* --- 2. Clinical Details --- */}
                    <div>
                        <div className="flex items-center mb-3 text-green-700 font-bold text-sm uppercase border-b border-gray-100 pb-1">
                            <FontAwesomeIcon icon={faStethoscope} className="mr-2" /> Clinical Information
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Clinic */}
                            <div>
                                <InputLabel value="Clinic / Treatment Point *" className="mb-1" />
                                <select
                                    value={data.treatmentpoint_id}
                                    onChange={e => setData('treatmentpoint_id', e.target.value)}
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm ${errors.treatmentpoint_id ? 'border-red-500' : ''}`}
                                    required
                                >
                                    <option value="">Select Clinic...</option>
                                    {treatmentPoints.map(tp => (
                                        <option key={tp.id} value={tp.id}>{tp.name}</option>
                                    ))}
                                </select>
                                {errors.treatmentpoint_id && <p className="text-red-500 text-xs mt-1">{errors.treatmentpoint_id}</p>}
                            </div>
                            
                            {/* Doctor */}
                            <div>
                                <InputLabel value="Assign Doctor" className="mb-1" />
                                <select
                                    value={data.doctor_user_id}
                                    onChange={e => setData('doctor_user_id', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                >
                                    <option value="">Any Available Doctor</option>
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* --- 3. Payment Mode & Subgroups --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                        
                        {/* Payment Mode */}
                        <div className={showSubgroups ? "col-span-1" : "col-span-1 md:col-span-2"}>
                            <InputLabel value="Payment Mode *" className="mb-1" />
                            <select
                                value={data.billinggroup_id}
                                onChange={handleGroupChange}
                                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                                    errors.billinggroup_id ? 'border-red-500' : ''
                                }`}
                                required
                            >
                                <option value="">Select Mode...</option>
                                {billingGroups.map(bg => (
                                    <option key={bg.id} value={bg.id}>
                                        {bg.name}
                                    </option>
                                ))}
                            </select>
                            {errors.billinggroup_id && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.billinggroup_id}
                                </p>
                            )}
                        </div>

                        {/* Billing Subgroup & Card Number */}
                        {showSubgroups && (
                            <>
                                <div className="col-span-1 animate-fade-in">
                                    <InputLabel value="Billing Subgroup *" className="mb-1" />
                                    <select
                                        value={data.billingsubgroup_id} 
                                        onChange={e => setData('billingsubgroup_id', e.target.value)}
                                        className={`w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${
                                            errors.billingsubgroup_id ? 'border-red-500' : ''
                                        }`}
                                        required={showSubgroups}
                                    >
                                        <option value="">Select Subgroup...</option>
                                        {billingSubgroups.map(bs => (
                                            <option key={bs.id} value={bs.id}>
                                                {bs.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.billingsubgroup_id && ( 
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.billingsubgroup_id} 
                                        </p>
                                    )}
                                </div>

                                {/* Show Card Number specifically for Staff/Cash groups that have subgroups. 
                                    (Insurance groups will handle this in the section below) */}
                                {isCash && (
                                    <div className="col-span-1 md:col-span-2 animate-fade-in">
                                        <InputLabel className="mb-1">
                                            <FontAwesomeIcon icon={faIdCard} className="mr-1 text-purple-500"/> Card / Member Number
                                        </InputLabel>
                                        <TextInput
                                            type="text"
                                            value={data.billinggroupmembershipno}
                                            onChange={e => setData('billinggroupmembershipno', e.target.value)}
                                            className="w-full bg-white text-sm shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="N/A"
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* --- RESTORED: INSURANCE/COMPANY FIELDS (HIDE IF CASH) --- */}
                        {!isCash && (
                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-4 bg-purple-50 rounded-lg border border-purple-100 animate-fade-in">
                                
                                {/* Card Number */}
                                <div>
                                    <InputLabel className="mb-1">
                                        <FontAwesomeIcon icon={faIdCard} className="mr-1 text-purple-500"/> Card Number
                                    </InputLabel>
                                    <TextInput
                                        type="text"
                                        value={data.billinggroupmembershipno}
                                        onChange={e => setData('billinggroupmembershipno', e.target.value)}
                                        className="w-full bg-white text-sm shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="N/A"
                                    />
                                </div>

                                {/* Auth Number */}
                                <div>
                                    <InputLabel className="mb-1">
                                        <FontAwesomeIcon icon={faCheck} className="mr-1 text-purple-500"/> Auth Number
                                    </InputLabel>
                                    <TextInput
                                        type="text"
                                        value={data.authorizationno}
                                        onChange={e => setData('authorizationno', e.target.value)}
                                        className={`w-full text-sm shadow-sm focus:ring-purple-500 focus:border-purple-500 font-bold ${isAuthLinked ? 'bg-green-100 text-green-800' : 'bg-white'}`}
                                        placeholder="N/A"
                                        readOnly={isAuthLinked} 
                                    />
                                </div>

                                {/* Scheme ID */}
                                <div className="md:col-span-2">
                                    <InputLabel className="mb-1">
                                        <FontAwesomeIcon icon={faHashtag} className="mr-1 text-purple-500"/> Scheme / Product ID
                                    </InputLabel>
                                    <TextInput
                                        type="text"
                                        value={data.schemeid}
                                        onChange={e => setData('schemeid', e.target.value)}
                                        className="w-full bg-white text-sm shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="N/A"
                                        readOnly={isAuthLinked}
                                    />
                                </div>

                            </div>
                        )}

                    </div>
                </div>

                {/* --- Footer Buttons --- */}
                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        type="button"
                        className="px-5 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        type="button"
                        disabled={processing}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-sm text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin /> Processing...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faCheck} /> Confirm Registration
                            </>
                        )}
                    </button>
                </div>

            </div>
        </Modal>
    );
}