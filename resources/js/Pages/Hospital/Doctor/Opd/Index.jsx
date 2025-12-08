import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout'; // Ensure you have this or use AuthenticatedLayout
import Pagination from '@/Components/Pagination'; // Generic pagination component

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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name / Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vitals (BP/Pulse)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {queue.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No patients in queue.</td>
                                        </tr>
                                    ) : (
                                        queue.data.map((booking) => (
                                            <tr key={booking.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(booking.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{booking.patient?.first_name} {booking.patient?.last_name}</div>
                                                    <div className="text-sm text-gray-500">{booking.patientcode}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {booking.latest_vital_sign ? (
                                                        <span className={booking.latest_vital_sign.blood_pressure.startsWith('14') ? 'text-red-600 font-bold' : ''}>
                                                            BP: {booking.latest_vital_sign.blood_pressure} | P: {booking.latest_vital_sign.pulse}
                                                        </span>
                                                    ) : (
                                                        <span className="text-yellow-600 italic">Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link 
                                                        href={route('doctor.opd.create', booking.id)} 
                                                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md"
                                                    >
                                                        Consult
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
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