import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';

export default function RadRequestsIndex({ requests, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('radiology0.index'), { search }, { preserveState: true });
    };

    const markCaptured = (id) => {
        if(confirm("Confirm that the image has been taken?")) {
            router.post(route('radiology0.process', id));
        }
    };

    return (
        <HospitalLayout header={<h2>Radiology Worklist</h2>}>
            <Head title="Imaging Requests" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* Toolbar */}
                    <div className="flex justify-between items-center mb-6">
                        <form onSubmit={handleSearch} className="flex gap-2 w-1/3">
                            <TextInput 
                                className="w-full"
                                placeholder="Search Patient..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <PrimaryButton>Search</PrimaryButton>
                        </form>
                    </div>

                    {/* Table */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs uppercase">Procedure / Modality</th>
                                <th className="px-6 py-3 text-left text-xs uppercase">Ordered By</th>
                                <th className="px-6 py-3 text-right text-xs uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No pending requests.</td>
                                </tr>
                            ) : (
                                requests.data.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(req.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{req.patient.first_name} {req.patient.last_name}</div>
                                            <div className="text-xs text-gray-500">{req.patientcode}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{req.procedure?.name}</div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {req.procedure?.modality?.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {req.requested_by?.name || 'Dr. Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button 
                                                onClick={() => markCaptured(req.id)}
                                                className="bg-green-600 text-white px-3 py-1 rounded text-xs uppercase hover:bg-green-700 font-bold transition"
                                            >
                                                Mark Done
                                            </button>
                                            <button className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">Reject</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="mt-4">
                        {requests.links && <Pagination links={requests.links} />}
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}