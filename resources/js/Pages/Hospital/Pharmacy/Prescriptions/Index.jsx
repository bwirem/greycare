import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';

export default function PrescriptionsIndex({ prescriptions, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(route('pharmacy.prescriptions.index'), { search, status }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>Prescription History</h2>}>
            <Head title="Rx History" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* Toolbar */}
                    <div className="flex gap-4 mb-6">
                        <TextInput 
                            className="w-1/3"
                            placeholder="Search Patient..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onBlur={handleFilter}
                        />
                        <select 
                            className="border-gray-300 rounded shadow-sm"
                            value={status}
                            onChange={e => { setStatus(e.target.value); handleFilter(); }}
                        >
                            <option value="">All Statuses</option>
                            <option>Prescribed</option>
                            <option>Dispensed</option>
                            <option>Partial</option>
                            <option>Cancelled</option>
                        </select>
                    </div>

                    {/* Table */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs uppercase">Item</th>
                                <th className="px-6 py-3 text-left text-xs uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {prescriptions.data.map((rx) => (
                                <tr key={rx.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(rx.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{rx.patient.first_name} {rx.patient.last_name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {rx.product?.name} ({rx.quantity_prescribed})
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            rx.status === 'Dispensed' ? 'bg-green-100 text-green-800' :
                                            rx.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {rx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            href={route('pharmacy.prescriptions.show', rx.id)}
                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold"
                                        >
                                            Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4">
                        {prescriptions.links && <Pagination links={prescriptions.links} />}
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}