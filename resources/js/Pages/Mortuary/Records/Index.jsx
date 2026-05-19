import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/MortuaryLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faClock, faWarehouse } from '@fortawesome/free-solid-svg-icons';

export default function RecordsIndex({ records, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('mortuary0.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>Mortuary - Pending Bodies</h2>}>
            <Head title="Pending Bodies" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/2">
                            <TextInput 
                                className="w-full" placeholder="Search by Name or Patient Code..." 
                                value={search} onChange={e => setSearch(e.target.value)}
                            />
                            <PrimaryButton><FontAwesomeIcon icon={faSearch} /></PrimaryButton>
                        </form>

                        {/* Completely New Registration from outside the hospital */}
                        <Link href={route('mortuary0.create')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold flex items-center gap-2">
                            <FontAwesomeIcon icon={faPlus} /> New Registration
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-3 text-left">Identity</th>
                                    <th className="px-6 py-3 text-left">Gender / Age</th>
                                    <th className="px-6 py-3 text-left">Date of Death</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {records.data.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">No pending bodies found.</td></tr>
                                ) : (
                                    records.data.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{record.first_name} {record.last_name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{record.patient_code || 'B.I.D (Unknown)'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {record.gender} | {record.age ? `${record.age} Yrs` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                                                {new Date(record.date_of_death).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    <FontAwesomeIcon icon={faClock} className="mr-1 mt-0.5" /> Pending
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* Edit link acts as "Receive/Assign Storage" for bodies from the ward */}
                                                <Link 
                                                    href={route('mortuary0.edit', record.id)} 
                                                    className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded text-xs font-bold inline-flex items-center gap-1"
                                                >
                                                    <FontAwesomeIcon icon={faWarehouse} /> Assign Storage
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4">{records.links && <Pagination links={records.links} />}</div>
                </div>
            </div>
        </HospitalLayout>
    );
}