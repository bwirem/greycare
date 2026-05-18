import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/SpecializedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faPlus, faSearch, faFolderOpen, faStethoscope, 
    faHistory, faCalendarAlt, faUserCircle, faBaby, faClipboardList 
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function Index({ auth, pregnancies, filters, success }) {
    const [search, setSearch] = useState(filters.search || "");

    useEffect(() => { 
        if (success) toast.success(success); 
    }, [success]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("rch1.index"), { search }, { preserveState: true });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-bold text-gray-800 leading-tight">Antenatal Care Register (ANC)</h2>}
        >
            <Head title="ANC Register" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Top Stats / Info Banner (Optional, makes UI look complete) */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-lg shadow-sm">
                        <div>
                            <h3 className="text-indigo-900 font-bold text-lg flex items-center">
                                <FontAwesomeIcon icon={faBaby} className="mr-2 opacity-80" /> 
                                ANC Clinic Dashboard
                            </h3>
                            <p className="text-indigo-700 text-sm">Manage active pregnancies, record daily visits, and review patient histories.</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Link
                                href={route("rch1.register.create")}
                                className="flex-1 md:flex-none text-center bg-white text-indigo-700 border border-indigo-200 px-4 py-2 rounded-md hover:bg-indigo-50 font-bold text-sm transition shadow-sm"
                            >
                                <FontAwesomeIcon icon={faFolderOpen} className="mr-2" /> New Enrollment
                            </Link>
                            <Link
                                href={route("rch1.visit.create")}
                                className="flex-1 md:flex-none text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-bold text-sm transition shadow-sm"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Start Visit
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white shadow-md sm:rounded-xl overflow-hidden border border-gray-200">
                        
                        {/* Search Bar Area */}
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <form onSubmit={handleSearch} className="relative w-full md:w-96">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by Patient Name or File No..."
                                    className="w-full rounded-lg border-gray-300 pl-10 pr-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                                />
                                <button type="submit" className="hidden">Search</button>
                            </form>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100/80">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ANC Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">LMP / EDD</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Visits</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {pregnancies.data.length > 0 ? (
                                        pregnancies.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                
                                                {/* Patient Name & Code */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                            <FontAwesomeIcon icon={faUserCircle} className="text-indigo-500 text-xl" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                                {row.patient?.first_name} {row.patient?.last_name}
                                                            </div>
                                                            <div className="text-xs font-mono text-gray-500 mt-0.5 border border-gray-200 bg-gray-50 inline-block px-1.5 rounded">
                                                                {row.patient_code}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ANC & Parity */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-800">
                                                        {row.anc_number || <span className="text-gray-400 italic">No ANC#</span>}
                                                    </div>
                                                    <div className="text-xs mt-1 font-medium text-gray-600 bg-blue-50 border border-blue-100 inline-block px-2 py-0.5 rounded-full">
                                                        G: <span className="font-bold">{row.gravida}</span> | P: <span className="font-bold">{row.parity}</span>
                                                    </div>
                                                </td>

                                                {/* Dates */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1.5 text-sm">
                                                        <div className="flex items-center text-gray-600">
                                                            <span className="text-xs uppercase text-gray-400 font-bold w-10">LMP:</span> 
                                                            <span className="font-medium text-gray-700 ml-1">{formatDate(row.lmp_date)}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="text-xs uppercase text-gray-400 font-bold w-10">EDD:</span> 
                                                            <span className="font-bold text-green-600 ml-1 flex items-center">
                                                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1 opacity-70"/> 
                                                                {formatDate(row.edd_date)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Visits Badge */}
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm border border-blue-200">
                                                            {row.visits_count}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Recorded</span>
                                                    </div>
                                                </td>

                                                {/* BEAUTIFIED ACTION COLUMN */}
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <div className="flex items-center justify-center gap-3">
                                                        
                                                        {/* Primary Action: Add Visit */}
                                                        <Link 
                                                            href={route("rch1.visit.create", { patient_code: row.patient_code })} 
                                                            className="inline-flex items-center px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm"
                                                            title="Record New Visit"
                                                        >
                                                            <FontAwesomeIcon icon={faStethoscope} className="mr-2 text-sm" /> 
                                                            Add Visit
                                                        </Link>
                                                        
                                                        {/* Secondary Action: History */}
                                                        <Link 
                                                            href={route("rch1.history", row.id)} 
                                                            className="inline-flex items-center px-3 py-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm"
                                                            title="View Pregnancy History"
                                                        >
                                                            <FontAwesomeIcon icon={faClipboardList} className="mr-2 text-gray-500 text-sm" /> 
                                                            History
                                                        </Link>
                                                        
                                                    </div>
                                                </td>

                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <FontAwesomeIcon icon={faFolderOpen} className="text-4xl mb-3 opacity-50" />
                                                    <p className="text-lg font-medium text-gray-500">No active pregnancies found.</p>
                                                    <p className="text-sm mt-1">Adjust your search or register a new patient.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Area */}
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                            <Pagination links={pregnancies.links} />
                        </div>
                        
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}