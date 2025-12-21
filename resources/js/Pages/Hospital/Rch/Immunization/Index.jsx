import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/HospitalLayout";
import { Head, Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faSyringe, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function Index({ auth, records, filters, success }) {
    const [search, setSearch] = useState(filters.search || "");

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("rch4.index"), { search }, { preserveState: true });
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to remove this immunization record?")) {
            router.delete(route("rch4.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Immunization Register</h2>}
        >
            <Head title="Immunizations" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md sm:rounded-lg p-6">
                        
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <form onSubmit={handleSearch} className="flex w-full md:w-1/3">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search Child or Vaccine..."
                                    className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </form>

                            <Link
                                href={route("rch4.create")}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Administer Vaccine
                            </Link>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaccine</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch No</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {records.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{row.administered_date}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {row.patient?.first_name} {row.patient?.last_name}
                                                <div className="text-xs text-gray-500">{row.patient_code}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <div className="flex items-center">
                                                    <FontAwesomeIcon icon={faSyringe} className="text-blue-400 mr-2" />
                                                    {row.vaccine?.name} <span className="text-xs text-gray-500 ml-1">({row.vaccine?.code})</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-mono">{row.batch_number || '-'}</td>
                                            <td className="px-6 py-4 text-center space-x-3">
                                                <Link href={route("rch4.edit", row.id)} className="text-blue-600 hover:text-blue-900">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Link>
                                                <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-900">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {records.data.length === 0 && (
                                        <tr><td colSpan="5" className="text-center py-4 text-gray-500">No records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4"><Pagination links={records.links} /></div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}