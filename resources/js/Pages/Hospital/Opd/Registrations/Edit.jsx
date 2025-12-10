import React from 'react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSave, faTimes, faUserEdit, faUser, faFileInvoice, faStethoscope 
} from "@fortawesome/free-solid-svg-icons";

export default function OpdEdit({ auth, booking, treatmentPoints, billingGroups, doctors }) {
    
    // Initialize Form State with Existing Data
    const { data, setData, put, processing, errors } = useForm({
        // Patient Details
        first_name: booking.patient?.first_name || '',
        last_name: booking.patient?.last_name || '',
        middle_name: booking.patient?.middle_name || '',
        contact: booking.patient?.contact || '', // Assuming contact exists on patient model
        
        // Visit Details
        treatmentpoint_id: booking.treatmentpoint_id || '',
        doctor_user_id: booking.doctor_user_id || '',
        
        // Billing Details
        billinggroup_id: booking.billinggroup_id || '',
        schemeid: booking.schemeid || '',
    });

    const submit = (e) => {
        e.preventDefault();
        // Use PUT for updates
        put(route('outpatient0.update', booking.id));
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

                            {/* Read Only Fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Gender</label>
                                <input
                                    type="text"
                                    value={booking.patient?.gender || ''}
                                    disabled
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                                <input
                                    type="text"
                                    value={booking.patient?.date_of_birth || ''}
                                    disabled
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- Section 2: Visit & Billing --- */}
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