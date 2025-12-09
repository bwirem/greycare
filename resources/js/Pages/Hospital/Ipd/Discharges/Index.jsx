import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';

export default function DischargesIndex({ admissions }) {
    const [search, setSearch] = useState('');

    const handleSearch = (e) => {
        // Implement client-side filtering or server-side reload
    };

    return (
        <HospitalLayout header={<h2>Patient Discharge Process</h2>}>
            <Head title="Discharges" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    <div className="mb-4 text-sm text-gray-600">
                        Select a patient below to process their discharge and release the bed.
                    </div>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-red-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Current Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Admitted Since</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-red-800 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admissions.data.map((adm) => (
                                <tr key={adm.id} className="hover:bg-red-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {adm.patient.first_name} {adm.patient.last_name}
                                        </div>
                                        <div className="text-xs text-gray-500">{adm.patientcode}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {adm.ward?.name} / {adm.bed?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(adm.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link 
                                            href={route('inpatient1.create', adm.id)}
                                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded shadow-sm text-xs uppercase font-bold tracking-wider"
                                        >
                                            Discharge &rarr;
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4">
                        {admissions.links && <Pagination links={admissions.links} />}
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}