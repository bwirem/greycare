import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';

export default function MinorIndex({ bookings }) {
    
    const completeProc = (id) => {
        if(confirm('Mark procedure as completed?')) {
            router.post(route('theatre0.complete', id));
        }
    };

    return (
        <HospitalLayout header={<h2>Minor Theatre Procedures</h2>}>
            <Head title="Minor Theatre" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex justify-end mb-4">
                    <Link href={route('theatre0.create')} className="bg-blue-600 text-white px-4 py-2 rounded shadow">
                        Book Minor Procedure
                    </Link>
                </div>

                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs uppercase font-medium text-gray-500">Time</th>
                                <th className="px-6 py-3 text-left text-xs uppercase font-medium text-gray-500">Patient</th>
                                <th className="px-6 py-3 text-left text-xs uppercase font-medium text-gray-500">Procedure</th>
                                <th className="px-6 py-3 text-left text-xs uppercase font-medium text-gray-500">Status</th>
                                <th className="px-6 py-3 text-right text-xs uppercase font-medium text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.data.map(bk => (
                                <tr key={bk.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{new Date(bk.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                    <td className="px-6 py-4 font-bold">{bk.patient.first_name} {bk.patient.last_name}</td>
                                    <td className="px-6 py-4">{bk.procedure.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs ${bk.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {bk.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {bk.status !== 'Completed' && (
                                            <button onClick={() => completeProc(bk.id)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase">
                                                Mark Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </HospitalLayout>
    );
}