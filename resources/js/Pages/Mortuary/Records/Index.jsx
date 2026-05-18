import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/MortuaryLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';

export default function RecordsIndex({ records, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('mortuary0.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>Mortuary - Deceased Records</h2>}>
            <Head title="Mortuary Records" />

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

                        <Link href={route('mortuary0.create')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold flex items-center gap-2">
                            <FontAwesomeIcon icon={faPlus} /> Receive Body
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-3 text-left">Identity</th>
                                    <th className="px-6 py-3 text-left">Gender / Age</th>
                                    <th className="px-6 py-3 text-left">Date of Death</th>
                                    <th className="px-6 py-3 text-left">Cabinet / Location</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {records.data.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">No stored bodies found.</td></tr>
                                ) : (
                                    records.data.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{record.first_name} {record.last_name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{record.patient_code || 'B.I.D (Unknown Code)'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {record.gender} | {record.age ? `${record.age} Yrs` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                                                {new Date(record.date_of_death).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                                {record.cabinet_number || 'Pending Assignment'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    <FontAwesomeIcon icon={faSkullCrossbones} className="mr-1 mt-0.5" /> Stored
                                                </span>
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