import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';

export default function SchedulingIndex({ bookings }) {
    return (
        <HospitalLayout header={<h2>Surgery Schedule</h2>}>
            <Head title="Scheduling" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex justify-end mb-4">
                    <Link href={route('theatre1.create')} className="bg-indigo-600 text-white px-4 py-2 rounded shadow">
                        Schedule Surgery
                    </Link>
                </div>

                <div className="bg-white p-6 shadow rounded-lg">
                    <table className="min-w-full">
                        <thead className="bg-indigo-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Date/Time</th>
                                <th className="px-4 py-2 text-left">Patient</th>
                                <th className="px-4 py-2 text-left">Procedure</th>
                                <th className="px-4 py-2 text-left">Surgeon</th>
                                <th className="px-4 py-2 text-left">Room</th>
                                <th className="px-4 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.data.map(bk => (
                                <tr key={bk.id} className="border-b">
                                    <td className="px-4 py-3">{new Date(bk.scheduled_at).toLocaleString()}</td>
                                    <td className="px-4 py-3 font-medium">{bk.patient.first_name}</td>
                                    <td className="px-4 py-3">{bk.procedure.name}</td>
                                    <td className="px-4 py-3">{bk.doctor.name}</td>
                                    <td className="px-4 py-3">{bk.theatre_room}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href="#" className="text-red-500 text-xs font-bold uppercase">Cancel</Link>
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