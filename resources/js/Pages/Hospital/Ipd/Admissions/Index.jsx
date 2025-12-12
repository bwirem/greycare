import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed, faSearch, faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function AdmissionsIndex({ admissions, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('inpatient0.index'), { search }, { preserveState: true });
    };

    return (
        <HospitalLayout header={<h2>IPD Admissions Registry</h2>}>
            <Head title="Admissions" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/2">
                            <TextInput 
                                className="w-full"
                                placeholder="Search Patient Name or Code..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <PrimaryButton><FontAwesomeIcon icon={faSearch} /></PrimaryButton>
                        </form>
                        <Link 
                            href={route('inpatient0.create')} 
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold flex items-center gap-2 whitespace-nowrap"
                        >
                            <FontAwesomeIcon icon={faBed} /> New Admission
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-3 text-left">Patient</th>
                                    <th className="px-6 py-3 text-left">Current Location</th>
                                    <th className="px-6 py-3 text-left">Admission Date</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {admissions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">No active or pending admissions found.</td>
                                    </tr>
                                ) : (
                                    admissions.data.map((adm) => (
                                        <tr key={adm.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {adm.patient.first_name} {adm.patient.last_name}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono">{adm.patientcode}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {adm.status === 'Pending' ? (
                                                    <div className="text-sm text-gray-500 italic">
                                                        Req: {adm.ward?.name || 'Any Ward'}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-900">
                                                        <span className="font-semibold">{adm.ward?.name}</span>
                                                        <div className="text-xs text-gray-500">
                                                            Rm: {adm.room?.name} | Bed: {adm.bed?.name}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(adm.admission_date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {adm.status === 'Pending' ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                                                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1 mt-0.5" /> Pending Bed
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1 mt-0.5" /> Admitted
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {adm.status === 'Pending' ? (
                                                    <Link 
                                                        href={route('inpatient0.create', { admission_id: adm.id })}
                                                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded shadow-sm"
                                                    >
                                                        Assign Bed
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400 cursor-not-allowed">Processed</span>
                                                )}
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