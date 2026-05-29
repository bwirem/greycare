import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Pagination from '@/Components/Pagination';
import TextInput from '@/Components/TextInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

export default function TransfersIndex({ admissions, filters = {} }) {
    
    // --- State for Search ---
    const [search, setSearch] = useState(filters.search || '');
    const isMounted = useRef(false);

    // --- Debounced Auto-Search Effect ---
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            router.get(
                window.location.pathname,
                { search },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300); // Wait 300ms after user stops typing to fetch

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    return (
        <HospitalLayout header={<h2>Ward Transfers</h2>}>
            <Head title="Transfers" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* Header & Search Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="text-sm text-gray-600 w-full md:w-1/2">
                            Manage internal patient movements between wards, rooms, or beds.
                        </div>

                        <div className="relative w-full md:w-1/3">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                            </div>
                            <TextInput 
                                className="w-full pl-10"
                                placeholder="Search Patient Name or Code..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Transfers Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Current Location</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-blue-800 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {admissions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-400 italic">
                                            {search ? 'No admitted patients match your search.' : 'No patients currently admitted.'}
                                        </td>
                                    </tr>
                                ) : (
                                    admissions.data.map((adm) => (
                                        <tr key={adm.id} className="hover:bg-blue-50/50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {adm.patient?.first_name} {adm.patient?.last_name}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono">
                                                    {adm.patientcode}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <span className="font-semibold text-gray-900">{adm.ward?.name}</span> 
                                                <span className="mx-2 text-gray-400">&raquo;</span> 
                                                <span className="text-gray-600">{adm.bed?.name}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link 
                                                    href={route('inpatient2.create', adm.id)}
                                                    className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded text-xs font-bold uppercase transition"
                                                >
                                                    <FontAwesomeIcon icon={faExchangeAlt} /> Transfer Location
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