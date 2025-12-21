import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/SpecializedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faEdit, faTrash, faWalking } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function Index({ auth, sessions, filters, success }) {
    const [search, setSearch] = useState(filters.search || "");

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("physiotherapy0.index"), { search }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Physiotherapy Sessions</h2>}
        >
            <Head title="Physiotherapy" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md sm:rounded-lg p-6">
                        
                        {/* Header & Search */}
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

                            <Link
                                href={route("physiotherapy0.create")}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> New Session
                            </Link>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Treatments</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aims/Notes</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sessions.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                {new Date(row.session_start).toLocaleDateString()}
                                                <div className="text-xs text-gray-500">{new Date(row.session_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {row.patient?.first_name} {row.patient?.last_name}
                                                <div className="text-xs text-gray-500">{row.patient_code}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <div className="flex flex-wrap gap-1">
                                                    {row.treatments && row.treatments.length > 0 ? (
                                                        row.treatments.map(t => (
                                                            <span key={t.id} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                                                                {t.type?.name}
                                                            </span>
                                                        ))
                                                    ) : <span className="text-gray-400 italic">None</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {row.aims_of_therapy || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs ${row.session_end ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {row.session_end ? 'Completed' : 'In Progress'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center space-x-3">
                                                <Link href={route("physiotherapy0.edit", row.id)} className="text-indigo-600 hover:text-indigo-900">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {sessions.data.length === 0 && (
                                        <tr><td colSpan="6" className="text-center py-4 text-gray-500">No sessions found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4"><Pagination links={sessions.links} /></div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}