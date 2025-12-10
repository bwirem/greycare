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
        router.get(route('bloodbank2.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>Blood Issue Requests</h2>}>
            <Head title="Requests" />

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
                        <thead className="bg-red-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-red-800 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-red-800 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-red-800 uppercase">Required</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-red-800 uppercase">Urgency</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-red-800 uppercase">Doctor</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-red-800 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No pending requests.</td>
                                </tr>
                            ) : (
                                requests.data.map((req) => (
                                    <tr key={req.id} className="hover:bg-red-50">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(req.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{req.patient.first_name} {req.patient.last_name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{req.patientcode}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-red-700">{req.blood_group_required}</div>
                                            <div className="text-xs text-gray-600">{req.component_type?.name} ({req.units_required} U)</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                req.urgency === 'Emergency' ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {req.urgency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {req.requested_by?.name}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={route('bloodbank2.create', req.id)}
                                                className="bg-red-600 text-white px-3 py-1.5 rounded text-xs uppercase hover:bg-red-700 font-bold shadow"
                                            >
                                                Process
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