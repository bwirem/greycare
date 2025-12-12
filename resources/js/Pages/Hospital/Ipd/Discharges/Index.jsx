import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserCheck, faDoorOpen } from '@fortawesome/free-solid-svg-icons';

export default function DischargesIndex({ admissions, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('inpatient1.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>Patient Discharge Process</h2>}>
            <Head title="Discharges" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* Header & Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="text-sm text-gray-600">
                            Select a patient to finalize billing and release the bed.
                            <br/>
                            <span className="text-green-700 font-bold"><FontAwesomeIcon icon={faUserCheck}/> Doctor Cleared</span> items should be processed first.
                        </div>

                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                            <TextInput 
                                className="w-full"
                                placeholder="Search Patient Name or Code..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <PrimaryButton><FontAwesomeIcon icon={faSearch} /></PrimaryButton>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-red-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-red-800 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-red-800 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-red-800 uppercase tracking-wider">Admitted Since</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-red-800 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-red-800 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {admissions.data.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">No patients found.</td></tr>
                                ) : (
                                    admissions.data.map((adm) => (
                                        <tr key={adm.id} className={adm.status === 'Discharge Pending' ? 'bg-green-50 hover:bg-green-100 transition' : 'hover:bg-red-50 transition'}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {adm.patient.first_name} {adm.patient.last_name}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono">{adm.patientcode}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <span className="font-semibold">{adm.ward?.name}</span>
                                                <span className="text-gray-400 mx-2">/</span>
                                                {adm.bed?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(adm.created_at).toLocaleDateString()}
                                                <span className="block text-xs text-gray-400">
                                                    {Math.ceil((new Date() - new Date(adm.created_at))/(1000*60*60*24))} days
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {adm.status === 'Discharge Pending' ? (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-200 text-green-800 border border-green-300">
                                                        <FontAwesomeIcon icon={faUserCheck} className="mr-1 mt-0.5"/> Doctor Cleared
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                                                        Admitted
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link 
                                                    href={route('inpatient1.create', adm.id)}
                                                    className="inline-flex items-center text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded shadow-sm text-xs uppercase font-bold tracking-wider"
                                                >
                                                    <FontAwesomeIcon icon={faDoorOpen} className="mr-2" /> Process
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4">
                        {admissions.links && <Pagination links={admissions.links} />}
                    </div>
                </div>
            </div>
        </HospitalLayout>
    );
}