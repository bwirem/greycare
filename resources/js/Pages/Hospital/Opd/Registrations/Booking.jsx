import React from 'react';
import Modal from '@/Components/Modal'; 
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faStethoscope, faFileInvoice, faCheck, faTimes, 
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
    doctors = [], 
    processing,
    defaultCashGroupId = null
}) {
    
    // --- 1. Determine Payment Category Logic ---
    const selectedGroup = billingGroups.find(bg => bg.id == data.billinggroup_id);
    
    // Default to 'Cash' (True) until proven otherwise by flags
    let isCash = true; 

    if (selectedGroup) {
        const isExemption = Boolean(selectedGroup.isexemption);
        const isInsurance = Boolean(selectedGroup.isinsurance);
        
        // If Facility has a default cash group, and this group is NOT it, it might be an Invoice/Company
        const isInvoice = defaultCashGroupId && selectedGroup.id != defaultCashGroupId;

        if (isExemption || isInsurance || isInvoice) {
            isCash = false;
        }
    }

    // --- 2. Auth Link Check ---
    const isAuthLinked = data.authorizationno && data.authorizationno.length > 0;

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

                    {/* --- 3. Billing & Insurance Details --- */}
                    <div>
                        <div className="flex items-center mb-3 text-purple-700 font-bold text-sm uppercase border-b border-gray-100 pb-1">
                            <FontAwesomeIcon icon={faFileInvoice} className="mr-2" /> Payment Information
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Payment Mode */}
                            <div className="md:col-span-2">
                                <InputLabel value="Payment Mode *" className="mb-1" />
                                <select
                                    value={data.billinggroup_id}
                                    onChange={e => setData('billinggroup_id', e.target.value)}
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${errors.billinggroup_id ? 'border-red-500' : ''}`}
                                    required
                                >
                                    <option value="">Select Mode...</option>
                                    {billingGroups.map(bg => (
                                        <option key={bg.id} value={bg.id}>{bg.name}</option>
                                    ))}
                                </select>
                                {errors.billinggroup_id && <p className="text-red-500 text-xs mt-1">{errors.billinggroup_id}</p>}
                            </div>

                            {/* --- HIDE IF CASH --- */}
                            {!isCash && (
                                <>
                                    {/* Insurance Details */}
                                    <div>
                                        <InputLabel className="mb-1">
                                            <FontAwesomeIcon icon={faIdCard} className="mr-1 text-gray-500"/> Card Number
                                        </InputLabel>
                                        <TextInput
                                            type="text"
                                            value={data.billinggroupmembershipno}
                                            onChange={e => setData('billinggroupmembershipno', e.target.value)}
                                            className="w-full bg-gray-50 text-sm shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="N/A"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel className="mb-1">
                                            <FontAwesomeIcon icon={faCheck} className="mr-1 text-gray-500"/> Auth Number
                                        </InputLabel>
                                        <TextInput
                                            type="text"
                                            value={data.authorizationno}
                                            onChange={e => setData('authorizationno', e.target.value)}
                                            className={`w-full text-sm shadow-sm focus:ring-purple-500 focus:border-purple-500 font-bold ${isAuthLinked ? 'bg-green-50 text-green-800' : 'bg-gray-50'}`}
                                            placeholder="N/A"
                                            readOnly={isAuthLinked} 
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <InputLabel className="mb-1">
                                            <FontAwesomeIcon icon={faHashtag} className="mr-1 text-gray-500"/> Scheme / Product ID
                                        </InputLabel>
                                        <TextInput
                                            type="text"
                                            value={data.schemeid}
                                            onChange={e => setData('schemeid', e.target.value)}
                                            className="w-full bg-gray-50 text-sm shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="N/A"
                                            readOnly={isAuthLinked}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Footer Buttons --- */}
                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
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