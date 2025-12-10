import React from 'react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faArrowLeft, faPrint, faUser, faStethoscope, faFileInvoice, faNotesMedical 
} from "@fortawesome/free-solid-svg-icons";

export default function OpdShow({ auth, booking }) {
    
    // Status Badge Logic (Shared)
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Waiting': return <span className="px-3 py-1 text-sm font-bold text-yellow-800 bg-yellow-100 rounded-full">Waiting</span>;
            case 'Triaged': return <span className="px-3 py-1 text-sm font-bold text-blue-800 bg-blue-100 rounded-full">Triaged</span>;
            case 'Closed': return <span className="px-3 py-1 text-sm font-bold text-blue-800 bg-blue-100 rounded-full">Triaged</span>;
            default: return <span className="px-3 py-1 text-sm font-bold text-gray-800 bg-gray-100 rounded-full">{status}</span>;
        }
    };

    return (
        <HospitalLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Visit Details: <span className="text-blue-600 font-mono">{booking.visit_number}</span>
                </h2>
            }
        >
            <Head title={`View ${booking.visit_number}`} />

            <div className="max-w-6xl mx-auto py-4">
                
                {/* --- Top Actions --- */}
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href={route('outpatient0.index')}
                        className="text-gray-500 hover:text-gray-700 flex items-center font-medium"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to List
                    </Link>

                    <a 
                        href={route('outpatient0.print_slip', booking.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest shadow-sm hover:bg-purple-700 transition"
                    >
                        <FontAwesomeIcon icon={faPrint} className="mr-2" /> Print Slip
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* --- Card 1: Patient Info --- */}
                    <div className="bg-white shadow rounded-lg overflow-hidden border-t-4 border-blue-500">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center">
                            <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
                            <h3 className="text-sm font-bold text-gray-700 uppercase">Patient Profile</h3>
                        </div>
                        <div className="p-6">
                            <div className="text-xl font-bold text-gray-800 mb-1">
                                {booking.patient?.first_name} {booking.patient?.middle_name} {booking.patient?.last_name}
                            </div>
                            <div className="text-sm text-gray-500 mb-4 font-mono">
                                File No: {booking.patientcode}
                            </div>
                            
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-xs text-gray-500">Gender</dt>
                                    <dd className="text-sm font-medium text-gray-900">{booking.patient?.gender}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500">Date of Birth</dt>
                                    <dd className="text-sm font-medium text-gray-900">{booking.patient?.date_of_birth}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500">National ID</dt>
                                    <dd className="text-sm font-medium text-gray-900">{booking.patient?.national_id || '-'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* --- Card 2: Visit Info --- */}
                    <div className="bg-white shadow rounded-lg overflow-hidden border-t-4 border-green-500">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center">
                            <FontAwesomeIcon icon={faStethoscope} className="text-green-500 mr-2" />
                            <h3 className="text-sm font-bold text-gray-700 uppercase">Visit Details</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-sm text-gray-500">Visit Date</div>
                                    <div className="font-medium">{new Date(booking.created_at).toLocaleString()}</div>
                                </div>
                                <div>{getStatusBadge(booking.vitalsignstatus === 'Closed' ? 'Triaged' : 'Waiting')}</div>
                            </div>

                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-xs text-gray-500">Clinic / Department</dt>
                                    <dd className="text-sm font-medium text-gray-900">{booking.treatment_point?.name || booking.wheretaken}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500">Assigned Doctor</dt>
                                    <dd className="text-sm font-medium text-gray-900">{booking.DoctorName || 'Unassigned'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500">Registered By</dt>
                                    <dd className="text-sm font-medium text-gray-900">{booking.user?.name}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* --- Card 3: Billing Info --- */}
                    <div className="bg-white shadow rounded-lg overflow-hidden border-t-4 border-purple-500">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center">
                            <FontAwesomeIcon icon={faFileInvoice} className="text-purple-500 mr-2" />
                            <h3 className="text-sm font-bold text-gray-700 uppercase">Billing Info</h3>
                        </div>
                        <div className="p-6">
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-xs text-gray-500">Payment Mode</dt>
                                    <dd className="text-lg font-bold text-gray-800">{booking.billing_group?.name || 'Cash'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500">Scheme ID / Card No</dt>
                                    <dd className="text-sm font-medium text-gray-900">{booking.schemeid || 'N/A'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                </div>

                {/* --- Optional: Vitals Summary (if captured) --- */}
                {booking.latest_vital_sign && (
                    <div className="mt-6 bg-white shadow rounded-lg overflow-hidden border-t-4 border-red-400">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center">
                            <FontAwesomeIcon icon={faNotesMedical} className="text-red-400 mr-2" />
                            <h3 className="text-sm font-bold text-gray-700 uppercase">Initial Vitals</h3>
                        </div>
                        <div className="p-6 grid grid-cols-4 gap-4">
                            <div>
                                <div className="text-xs text-gray-500">Weight</div>
                                <div className="text-lg font-bold">{booking.latest_vital_sign.weight} kg</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Temperature</div>
                                <div className="text-lg font-bold">{booking.latest_vital_sign.temperature} °C</div>
                            </div>
                            {/* Add other vitals if available */}
                        </div>
                    </div>
                )}

            </div>
        </HospitalLayout>
    );
}