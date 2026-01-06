import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/SpecializedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faFolderOpen, faStethoscope } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function Index({ auth, pregnancies, filters, success }) {
    const [search, setSearch] = useState(filters.search || "");

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("rch1.index"), { search }, { preserveState: true });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // 'en-GB' formats as dd/mm/yyyy, options allow Custom: 06 Jan 2025
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Antenatal Care Register (ANC)</h2>}
        >
            <Head title="ANC Register" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md sm:rounded-lg p-6">
                        
                        {/* Actions */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <form onSubmit={handleSearch} className="flex w-full md:w-1/3">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search Patient..."
                                    className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </form>

                            <div className="flex gap-2">
                                <Link
                                    href={route("rch1.register.create")}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                                >
                                    <FontAwesomeIcon icon={faFolderOpen} className="mr-2" /> Register New
                                </Link>
                                <Link
                                    href={route("rch1.visit.create")}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                                >
                                    <FontAwesomeIcon icon={faStethoscope} className="mr-2" /> Daily Visit
                                </Link>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ANC No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LMP / EDD</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gravida/Parity</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Visits</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pregnancies.data.length > 0 ? (
                                        pregnancies.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div className="font-bold">{row.patient?.first_name} {row.patient?.last_name}</div>
                                                    <div className="text-xs text-gray-500">{row.patient_code}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{row.anc_number || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    <div className="flex flex-col gap-1">
                                                        <div>
                                                            <span className="text-gray-500 text-xs w-10 inline-block">LMP:</span> 
                                                            <span className="font-medium">{formatDate(row.lmp_date)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 text-xs w-10 inline-block">EDD:</span> 
                                                            <span className="text-green-600 font-bold">{formatDate(row.edd_date)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">G{row.gravida} P{row.parity}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{row.visits_count}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center space-x-2">
                                                    <Link 
                                                        href={route("rch1.visit.create", { patient_code: row.patient_code })} 
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                    >
                                                        Add Visit
                                                    </Link>
                                                   
                                                    <Link 
                                                        href={route("rch1.history", row.id)} 
                                                        className="text-gray-600 hover:text-gray-900 text-sm font-medium border border-gray-200 px-2 py-1 rounded ml-2"
                                                    >
                                                        History
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                No active pregnancies found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4">
                            <Pagination links={pregnancies.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}