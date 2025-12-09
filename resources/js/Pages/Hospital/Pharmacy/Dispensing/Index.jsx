import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';

export default function DispensingIndex({ prescriptions, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('pharmacy.dispensing.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>Pharmacy Dispensing Queue</h2>}>
            <Head title="Dispensing" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* Toolbar */}
                    <div className="flex justify-between items-center mb-6">
                        <form onSubmit={handleSearch} className="flex gap-2 w-1/3">
                            <TextInput 
                                className="w-full"
                                placeholder="Search Patient Name or ID..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <PrimaryButton>Search</PrimaryButton>
                        </form>
                    </div>

                    {/* Table */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Drug / Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Doctor</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-green-800 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {prescriptions.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No pending prescriptions.</td>
                                </tr>
                            ) : (
                                prescriptions.data.map((rx) => (
                                    <tr key={rx.id} className="hover:bg-green-50">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(rx.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{rx.patient.first_name} {rx.patient.last_name}</div>
                                            <div className="text-xs text-gray-500">{rx.patientcode}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{rx.product?.name}</div>
                                            <div className="text-xs text-gray-500">{rx.dosage} - {rx.frequency}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700">
                                            {rx.quantity_prescribed}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {rx.doctor?.name}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={route('pharmacy.dispensing.create', rx.id)}
                                                className="bg-green-600 text-white px-3 py-1 rounded text-xs uppercase hover:bg-green-700 font-bold"
                                            >
                                                Dispense
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
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