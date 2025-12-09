import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';

export default function RadResultsIndex({ studies }) {
    return (
        <HospitalLayout header={<h2>Radiology Reporting</h2>}>
            <Head title="Reporting Queue" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase">Image Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase">Exam</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {studies.data.map((study) => (
                                <tr key={study.id} className="hover:bg-indigo-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(study.performed_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{study.patient.first_name} {study.patient.last_name}</div>
                                        <div className="text-xs text-gray-500">{study.patientcode}</div>
                                    </td>
                                    <td className="px-6 py-4">{study.procedure?.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            study.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {study.status === 'captured' ? 'Ready for Report' : study.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            href={route('radiology.results.create', study.id)}
                                            className="bg-indigo-600 text-white px-3 py-1 rounded text-xs uppercase hover:bg-indigo-700 font-bold"
                                        >
                                            Write Report
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4"><Pagination links={studies.links} /></div>
                </div>
            </div>
        </HospitalLayout>
    );
}