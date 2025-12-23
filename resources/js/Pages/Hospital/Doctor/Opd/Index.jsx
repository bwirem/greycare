import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

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
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
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
                                            // Determine if access is allowed
                                            // You might allow 'insurance' or 'waived' statuses as well
                                            const isPaid = booking.payment_status === 'paid' || booking.payment_status === 'waived';
                                            const isInsurance = booking.billingGroup?.name?.toLowerCase().includes('insurance'); 
                                            const canConsult = isPaid || isInsurance; // Logic: Allow if Paid OR Insurance

                                            return (
                                                <tr key={booking.id} className={!canConsult ? "bg-gray-50 opacity-75" : "hover:bg-gray-50"}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(booking.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900">{booking.patient?.first_name} {booking.patient?.last_name}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{booking.patientcode}</div>
                                                        <div className="text-xs text-blue-600">{booking.billingGroup?.name || 'Cash'}</div>
                                                    </td>
                                                    
                                                    {/* Payment Status Column */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                                                            booking.payment_status === 'waived' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {booking.payment_status ? booking.payment_status.toUpperCase() : 'UNPAID'}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {booking.latest_vital_sign ? (
                                                            <div className="flex flex-col">
                                                                <span className={(booking.latest_vital_sign.blood_pressure || '').startsWith('14') ? 'text-red-600 font-bold' : ''}>
                                                                    BP: {booking.latest_vital_sign.blood_pressure || '-'}
                                                                </span>
                                                                <span>Pulse: {booking.latest_vital_sign.pulse || '-'}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-yellow-600 italic text-xs">Vitals Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                                        {canConsult ? (
                                                            <Link 
                                                                href={route('doctor0.create', booking.id)} 
                                                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                            >
                                                                Consult
                                                            </Link>
                                                        ) : (
                                                            <span className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-500 uppercase tracking-widest cursor-not-allowed">
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