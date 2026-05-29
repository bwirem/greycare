import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';

export default function MinorIndex({ bookings }) {
    // --- State for Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [remarks, setRemarks] = useState('');

    // --- Handlers ---
    const openModal = (booking) => {
        setSelectedBooking(booking);
        setRemarks(''); // Reset remarks when opening
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
        setRemarks('');
    };

    const submitCompletion = (e) => {
        e.preventDefault();
        if (selectedBooking) {
            // Send the post request along with the remarks
            router.post(route('theatre0.complete', selectedBooking.id), {
                remarks: remarks
            }, {
                preserveScroll: true,
                onSuccess: () => closeModal(), // Close modal only on successful submission
            });
        }
    };

    return (
        <HospitalLayout header={<h2>Minor Theatre Procedures</h2>}>
            <Head title="Minor Theatre" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* <div className="flex justify-end mb-4">
                    <Link href={route('theatre0.create')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition">
                        Book Minor Procedure
                    </Link>
                </div> */}

                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
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
                        <tbody className="divide-y divide-gray-100">
                            {bookings.data.map(bk => (
                                <tr key={bk.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {new Date(bk.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                        {bk.patient.first_name} {bk.patient.last_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {bk.procedure.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            bk.status === 'Completed' 
                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                        }`}>
                                            {bk.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {bk.status !== 'Completed' && (
                                            <button 
                                                onClick={() => openModal(bk)} 
                                                className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition"
                                            >
                                                Mark Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            
                            {/* Empty State Fallback */}
                            {bookings.data.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No procedures scheduled.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- COMPLETION MODAL --- */}
            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                        
                        {/* Modal Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Complete Procedure</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 text-xl font-bold">
                                &times;
                            </button>
                        </div>

                        {/* Modal Body (Form) */}
                        <form onSubmit={submitCompletion}>
                            <div className="p-6 space-y-4">
                                {/* Context Info */}
                                <div className="bg-blue-50 p-3 rounded border border-blue-100 text-sm text-blue-800">
                                    <p><span className="font-semibold">Patient:</span> {selectedBooking.patient.first_name} {selectedBooking.patient.last_name}</p>
                                    <p><span className="font-semibold">Procedure:</span> {selectedBooking.procedure.name}</p>
                                </div>

                                {/* Remarks Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Procedure Remarks / Notes <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        rows="4"
                                        placeholder="Enter details about how the procedure went..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        autoFocus
                                    ></textarea>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition"
                                >
                                    Confirm Completion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </HospitalLayout>
    );
}