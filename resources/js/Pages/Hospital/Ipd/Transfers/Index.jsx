import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';

export default function TransfersIndex({ admissions }) {
    return (
        <HospitalLayout header={<h2>Ward Transfers</h2>}>
            <Head title="Transfers" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    <div className="mb-4 text-sm text-gray-600">
                        Manage internal patient movements between wards, rooms, or beds.
                    </div>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Current Location</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admissions.data.map((adm) => (
                                <tr key={adm.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {adm.patient.first_name} {adm.patient.last_name}
                                        </div>
                                        <div className="text-xs text-gray-500">{adm.patientcode}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {adm.ward?.name} &raquo; {adm.bed?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link 
                                            href={route('inpatient2.create', adm.id)}
                                            className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                        >
                                            Transfer Location
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