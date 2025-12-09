import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';

export default function ResultsIndex({ samples }) {
    return (
        <HospitalLayout header={<h2>Lab Results Processing</h2>}>
            <Head title="Lab Results" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Sample ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Test Panel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Collected At</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-green-800 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {samples.data.map((sample) => (
                                <tr key={sample.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-sm">{sample.sample_code}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{sample.prescription.patient.first_name} {sample.prescription.patient.last_name}</div>
                                    </td>
                                    <td className="px-6 py-4">{sample.prescription.panel.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(sample.collected_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            href={route('laboratory.results.create', sample.id)}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-xs uppercase hover:bg-green-700 font-bold"
                                        >
                                            Enter Results
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4"><Pagination links={samples.links} /></div>
                </div>
            </div>
        </HospitalLayout>
    );
}