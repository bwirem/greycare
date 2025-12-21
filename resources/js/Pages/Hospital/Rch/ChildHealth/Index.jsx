import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/HospitalLayout";
import { Head, Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faChartLine, faEdit } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function Index({ auth, assessments, filters, success }) {
    const [search, setSearch] = useState(filters.search || "");

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("rch3.index"), { search }, { preserveState: true });
    };

    // Helper for Status Badge
    const getStatusBadge = (status) => {
        const colors = {
            'Green': 'bg-green-100 text-green-800',
            'Grey': 'bg-gray-200 text-gray-800',
            'Red': 'bg-red-100 text-red-800'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Child Growth Monitoring</h2>}
        >
            <Head title="Child Health" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md sm:rounded-lg p-6">
                        
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <form onSubmit={handleSearch} className="flex w-full md:w-1/3">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search Child..."
                                    className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </form>

                            <Link
                                href={route("rch3.create")}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Record Growth
                            </Link>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curve Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assessments.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{row.created_at.substring(0, 10)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {row.patient?.first_name} {row.patient?.last_name}
                                                <div className="text-xs text-gray-500">{row.patient_code}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{row.age_months} Months</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {row.vitals ? `${row.vitals.weight} kg` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {getStatusBadge(row.weight_for_age_status)}
                                            </td>
                                            <td className="px-6 py-4 text-center space-x-3">
                                                <Link 
                                                    href={route("rch3.chart", row.patient_code)} 
                                                    className="text-purple-600 hover:text-purple-900"
                                                    title="View Chart"
                                                >
                                                    <FontAwesomeIcon icon={faChartLine} />
                                                </Link>
                                                <Link 
                                                    href={route("rch3.edit", row.id)} 
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {assessments.data.length === 0 && (
                                        <tr><td colSpan="6" className="text-center py-4 text-gray-500">No records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4"><Pagination links={assessments.links} /></div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}