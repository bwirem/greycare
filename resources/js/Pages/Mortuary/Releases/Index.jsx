import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/MortuaryLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faHandshake } from '@fortawesome/free-solid-svg-icons';

export default function ReleasesIndex({ records, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('mortuary1.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>Mortuary - Body Release Queue</h2>}>
            <Head title="Body Release" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="text-sm text-gray-600 font-medium">Select a body to process handover to relatives.</div>
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                            <TextInput 
                                className="w-full" placeholder="Search Body Name..." 
                                value={search} onChange={e => setSearch(e.target.value)}
                            />
                            <PrimaryButton><FontAwesomeIcon icon={faSearch} /></PrimaryButton>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-50 text-green-800 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-3 text-left">Deceased Name</th>
                                    <th className="px-6 py-3 text-left">Date of Death</th>
                                    <th className="px-6 py-3 text-left">Cabinet No.</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {records.data.length === 0 ? (
                                    <tr><td colSpan="4" className="p-8 text-center text-gray-500 italic">No bodies currently pending release.</td></tr>
                                ) : (
                                    records.data.map((record) => (
                                        <tr key={record.id} className="hover:bg-green-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{record.first_name} {record.last_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(record.date_of_death).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">
                                                {record.cabinet_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link 
                                                    href={route('mortuary1.create', record.id)}
                                                    className="inline-flex items-center text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded shadow-sm text-xs uppercase font-bold"
                                                >
                                                    <FontAwesomeIcon icon={faHandshake} className="mr-2" /> Process Release
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