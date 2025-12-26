import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheckCircle, 
    faTimesCircle, 
    faMoneyBillWave, 
    faStethoscope, 
    faIdCard,
    faBuilding,
    faHandHoldingHeart
} from '@fortawesome/free-solid-svg-icons';

export default function DoctorOpdIndex({ queue }) {
    return (
        <HospitalLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">OPD Consultation Queue</h2>}>
            <Head title="Doctor OPD Queue" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Details</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vitals</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {queue.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">No patients in queue.</td>
                                        </tr>
                                    ) : (
                                        queue.data.map((booking) => {
                                            // --- 1. DETERMINE CATEGORY DYNAMICALLY ---
                                            // Priority: Use the category stored on the patient record during registration
                                            let category = booking.patient?.payment_category || 'Cash';
                                            
                                            // Fallback: If patient category isn't set, infer from Billing Group flags
                                            if (!booking.patient?.payment_category && booking.billingGroup) {
                                                if (booking.billingGroup.isexemption) category = 'Exemption';
                                                else if (booking.billingGroup.isinsurance) category = 'Insurance';
                                                // Note: 'Invoice' fallback is harder without facility ID, so default to Cash implies pay first
                                            }

                                            // Booleans for UI logic
                                            const isCash      = category === 'Cash';
                                            const isInsurance = category === 'Insurance';
                                            const isExemption = category === 'Exemption';
                                            const isInvoice   = category === 'Invoice'; // Corporate

                                            // --- 2. PAYMENT STATUS ---
                                            const isPaid   = booking.payment_status === 'paid';
                                            const isWaived = booking.payment_status === 'waived' || isExemption;

                                            // --- 3. ACCESS CONTROL LOGIC ---
                                            // Logic: If it is CASH, they MUST pay. Everyone else (Insurance/Corp/Exempt) can proceed.
                                            const canConsult = !isCash || isPaid || isWaived;

                                            return (
                                                <tr key={booking.id} className={!canConsult ? "bg-red-50 opacity-90" : "hover:bg-gray-50"}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(booking.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900">{booking.patient?.first_name} {booking.patient?.last_name}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{booking.patientcode}</div>
                                                        <div className="text-xs font-bold text-blue-600 mt-1 flex items-center">
                                                            {/* Dynamic Icon based on Category */}
                                                            {isInsurance && <FontAwesomeIcon icon={faIdCard} className="mr-1"/>}
                                                            {isInvoice && <FontAwesomeIcon icon={faBuilding} className="mr-1"/>}
                                                            {isExemption && <FontAwesomeIcon icon={faHandHoldingHeart} className="mr-1"/>}
                                                            {booking.billingGroup?.name || category}
                                                        </div>
                                                    </td>
                                                    
                                                    {/* Payment Status Badge */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {isPaid ? (
                                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                                                                <FontAwesomeIcon icon={faCheckCircle} className="mr-1"/> PAID
                                                            </span>
                                                        ) : isExemption || isWaived ? (
                                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-100 text-gray-800">
                                                                EXEMPTION
                                                            </span>
                                                        ) : isInsurance ? (
                                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800">
                                                                INSURANCE
                                                            </span>
                                                        ) : isInvoice ? (
                                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-purple-100 text-purple-800">
                                                                CORPORATE
                                                            </span>
                                                        ) : (
                                                            // Only Cash + Unpaid gets the red flag
                                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                                                                <FontAwesomeIcon icon={faTimesCircle} className="mr-1"/> UNPAID
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {booking.latest_vital_sign ? (
                                                            <div className="flex flex-col text-xs">
                                                                <span className={(booking.latest_vital_sign.blood_pressure || '').startsWith('14') ? 'text-red-600 font-bold' : ''}>
                                                                    BP: {booking.latest_vital_sign.blood_pressure || '-'}
                                                                </span>
                                                                <span>Pulse: {booking.latest_vital_sign.pulse || '-'}</span>
                                                                <span>Temp: {booking.latest_vital_sign.temperature || '-'}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-amber-600 italic text-xs">Vitals Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                                        {canConsult ? (
                                                            <Link 
                                                                href={route('doctor0.create', booking.id)} 
                                                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                                                            >
                                                                <FontAwesomeIcon icon={faStethoscope} className="mr-2"/> Consult
                                                            </Link>
                                                        ) : (
                                                            <span className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-400 uppercase tracking-widest cursor-not-allowed">
                                                                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2"/> Pay First
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                            
                            <div className="mt-4">
                                <Pagination links={queue.links} />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}