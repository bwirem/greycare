import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';

export default function RequestsIndex({ requests, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('laboratory0.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>Lab Test Requests</h2>}>
            <Head title="Lab Requests" />

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
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase">Test Panel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase">Ordered By</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase">Action</th>
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
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                            {req.panel?.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {req.requested_by?.name || 'Doctor'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={route('laboratory0.create', req.id)}
                                                className="bg-indigo-600 text-white px-3 py-1 rounded text-xs uppercase hover:bg-indigo-700 font-bold"
                                            >
                                                Collect Sample
                                            </Link>
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