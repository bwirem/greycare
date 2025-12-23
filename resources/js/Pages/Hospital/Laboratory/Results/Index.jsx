import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';
import TextInput from '@/Components/TextInput'; // Assuming you have this
import PrimaryButton from '@/Components/PrimaryButton'; // Assuming you have this
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFlask, faEdit } from '@fortawesome/free-solid-svg-icons';

export default function ResultsIndex({ samples, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('laboratory1.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>Lab Results Processing</h2>}>
            <Head title="Lab Results" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* Search Toolbar */}
                    <div className="flex justify-between items-center mb-6">
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                            <TextInput 
                                className="w-full"
                                placeholder="Search Patient Name..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <PrimaryButton><FontAwesomeIcon icon={faSearch} /></PrimaryButton>
                        </form>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Sample ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Test Panel</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Collected At</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-green-800 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {samples.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">
                                            No pending samples found.
                                        </td>
                                    </tr>
                                ) : (
                                    samples.data.map((sample) => (
                                        <tr key={sample.id} className="hover:bg-green-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                    {sample.sample_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">
                                                    {sample.prescription.patient.first_name} {sample.prescription.patient.last_name}
                                                </div>
                                                <div className="text-xs text-gray-500">{sample.prescription.patientcode}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faFlask} className="text-green-600 opacity-50"/>
                                                    {sample.prescription.panel.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(sample.collected_at).toLocaleString()}
                                            </td>
                                            
                                            {/* Status Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {sample.status === 'collected' ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                        New
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                        In Progress
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link 
                                                    href={route('laboratory1.create', sample.id)}
                                                    className={`inline-flex items-center px-3 py-1 rounded text-xs uppercase font-bold shadow-sm transition ${
                                                        sample.status === 'collected' 
                                                        ? 'bg-green-600 text-white hover:bg-green-700' 
                                                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                    {sample.status === 'collected' ? 'Enter Results' : 'Continue'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4">
                        <Pagination links={samples.links} />
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}