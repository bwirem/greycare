import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/HospitalLayout";
import { Head, Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function Index({ auth, visits, filters, success }) {
    const [search, setSearch] = useState(filters.search || "");

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("rch0.index"), { search }, { preserveState: true });
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this visit record?")) {
            router.delete(route("rch0.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Family Planning Register</h2>}
        >
            <Head title="Family Planning" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md sm:rounded-lg p-6">
                        {/* Header Actions */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <form onSubmit={handleSearch} className="flex w-full md:w-1/3">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by Name or File No..."
                                    className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </form>

                            <Link
                                href={route("rch0.create")}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> New Visit
                            </Link>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BP / Weight</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Appt</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {visits.data.length > 0 ? (
                                        visits.data.map((visit) => (
                                            <tr key={visit.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{visit.visit_date}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div className="font-medium">{visit.patient?.first_name} {visit.patient?.last_name}</div>
                                                    <div className="text-xs text-gray-500">{visit.patient_code}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                        {visit.method?.code}
                                                    </span>
                                                    <span className="ml-2">{visit.method?.name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{visit.quantity}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    <div>BP: {visit.bp_systolic}/{visit.bp_diastolic}</div>
                                                    <div>Wt: {visit.weight_kg} kg</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-red-600 font-medium">{visit.next_appointment_date || '-'}</td>
                                                <td className="px-6 py-4 text-center space-x-3">
                                                    <Link href={route("rch0.edit", visit.id)} className="text-indigo-600 hover:text-indigo-900">
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(visit.id)} className="text-red-600 hover:text-red-900">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                No family planning visits found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4">
                            <Pagination links={visits.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}