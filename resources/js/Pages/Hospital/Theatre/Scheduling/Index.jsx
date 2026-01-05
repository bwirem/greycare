import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCalendarAlt, faUserMd, faProcedures, 
    faBan, faDoorOpen, faEdit, faPlus 
} from '@fortawesome/free-solid-svg-icons';

export default function SchedulingIndex({ bookings }) {
    
    const handleCancel = (id) => {
        if (confirm('Are you sure you want to cancel this surgery?')) {
            router.delete(route('theatre1.cancel', id));
        }
    };

    return (
        <HospitalLayout header={<h2 className="text-xl font-semibold text-gray-800">Surgery Schedule</h2>}>
            <Head title="Scheduling" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Header / Actions */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-bold text-gray-600">Upcoming Surgeries</h3>
                            <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 font-medium">
                                Total: {bookings.total}
                            </span>
                        </div>
                        
                        <Link href={route('theatre1.create')} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 flex items-center gap-2 text-sm font-bold">
                            <FontAwesomeIcon icon={faPlus} /> Schedule New
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date/Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Procedure</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Surgeon / Room</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bookings.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">
                                                No surgeries scheduled.
                                            </td>
                                        </tr>
                                    ) : (
                                        bookings.data.map(bk => (
                                            <tr key={bk.id} className="hover:bg-gray-50 transition">
                                                {/* Date */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-indigo-400" />
                                                        {new Date(bk.scheduled_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-400 pl-6 mt-1">
                                                        {new Date(bk.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                </td>

                                                {/* Patient */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {bk.patient?.first_name} {bk.patient?.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        {bk.patientcode}
                                                    </div>
                                                </td>

                                                {/* Procedure */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-800 font-medium">
                                                        {bk.procedure?.name}
                                                    </div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                        <FontAwesomeIcon icon={faProcedures} />
                                                        {bk.procedure?.type || 'General Surgery'}
                                                    </div>
                                                </td>

                                                {/* Surgeon & Room */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-700 flex items-center gap-2 mb-1">
                                                        <FontAwesomeIcon icon={faUserMd} className="text-gray-400" />
                                                        {bk.doctor?.name || 'Unassigned'}
                                                    </div>
                                                    {/* --- UPDATED SECTION: Uses bk.theatre.name --- */}
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faDoorOpen} className="text-gray-400" />
                                                        {bk.theatre?.name || 'Room Unassigned'}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    
                                                    {/* --- EDIT BUTTON -> theatre1.edit --- */}
                                                    <Link 
                                                        href={route('theatre1.edit', bk.id)} 
                                                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded text-xs font-bold uppercase transition border border-indigo-100"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} /> Edit
                                                    </Link>

                                                    {/* --- CANCEL BUTTON -> theatre1.cancel --- */}
                                                    <button 
                                                        onClick={() => handleCancel(bk.id)}
                                                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-bold uppercase transition border border-red-100"
                                                    >
                                                        <FontAwesomeIcon icon={faBan} /> Cancel
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 px-6 pb-6"><Pagination links={bookings.links} /></div>
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}