import React from 'react';
import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Chart({ auth, patient, history }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Growth History: {patient.first_name} {patient.last_name}</h2>}
        >
            <Head title="Growth Chart" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-4">
                        <Link href={route('rch3.index')} className="text-gray-600 hover:text-gray-900 flex items-center">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to List
                        </Link>
                    </div>

                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-700">Weight for Age Log</h3>
                        
                        {/* Simple Visual Representation / Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age (Months)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.map((item, index) => {
                                        // Calculate trend (Up/Down) based on previous record
                                        const prev = index > 0 ? history[index - 1] : null;
                                        let trend = "-";
                                        if (prev) {
                                            const diff = item.weight - prev.weight;
                                            if (diff > 0) trend = "⬆ Gained";
                                            else if (diff < 0) trend = "⬇ Lost";
                                            else trend = "➡ Static";
                                        }

                                        return (
                                            <tr key={index} className={item.status === 'Red' ? 'bg-red-50' : ''}>
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.date}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.age}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.weight > 0 ? item.weight : 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs text-white ${
                                                        item.status === 'Green' ? 'bg-green-500' :
                                                        item.status === 'Grey' ? 'bg-gray-500' : 'bg-red-500'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{trend}</td>
                                            </tr>
                                        );
                                    })}
                                    {history.length === 0 && (
                                        <tr><td colSpan="5" className="text-center py-4">No history available.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}