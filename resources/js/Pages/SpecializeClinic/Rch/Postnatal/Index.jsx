import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/SpecializedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBaby, faStethoscope, faSearch } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/Components/Pagination";
import { toast } from 'react-toastify';

export default function Index({ auth, deliveries, pncVisits, filters, success }) {
    const [activeTab, setActiveTab] = useState('deliveries');
    const [search, setSearch] = useState(filters.search || "");

    useEffect(() => { if (success) toast.success(success); }, [success]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("rch2.index"), { search }, { preserveState: true });
    };

    // --- Date Formatting Helpers ---
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }); // Output: "May 27, 2026, 04:48 AM"
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }); // Output: "May 27, 2026"
    };
    // -------------------------------

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Postnatal & Delivery Register</h2>}
        >
            <Head title="PNC Register" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md sm:rounded-lg p-6">
                        
                        {/* Search & Actions */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <form onSubmit={handleSearch} className="flex w-full md:w-1/3">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search Name or Code..."
                                    className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700">
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </form>

                            <div className="flex gap-2">
                                <Link
                                    href={route("rch2.delivery.create")}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
                                >
                                    <FontAwesomeIcon icon={faBaby} className="mr-2" /> Record Birth
                                </Link>
                                <Link
                                    href={route("rch2.visit.create")}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                                >
                                    <FontAwesomeIcon icon={faStethoscope} className="mr-2" /> PNC Visit
                                </Link>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-4">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('deliveries')}
                                    className={`${activeTab === 'deliveries' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    Deliveries Log
                                </button>
                                <button
                                    onClick={() => setActiveTab('pnc')}
                                    className={`${activeTab === 'pnc' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                >
                                    Maternal PNC Visits
                                </button>
                            </nav>
                        </div>

                        {/* Deliveries Table */}
                        {activeTab === 'deliveries' && (
                            <>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mother</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Baby Stats</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {deliveries.data.map((del) => (
                                                <tr key={del.id} className="hover:bg-gray-50">
                                                    {/* Updated Date Format Here */}
                                                    <td className="px-6 py-4 text-sm text-gray-900">{formatDateTime(del.delivery_datetime)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                        {del.pregnancy?.patient?.first_name} {del.pregnancy?.patient?.last_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">{del.mode_of_delivery}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`px-2 py-1 rounded text-xs ${del.outcome === 'Live Birth' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {del.outcome}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">
                                                        {del.child_gender}, {del.birth_weight_kg}kg
                                                    </td>
                                                </tr>
                                            ))}
                                            {deliveries.data.length === 0 && (
                                                <tr><td colSpan="5" className="text-center py-4 text-gray-500">No records found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4"><Pagination links={deliveries.links} /></div>
                            </>
                        )}

                        {/* PNC Table */}
                        {activeTab === 'pnc' && (
                            <>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mother</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timing</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checklist</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {pncVisits.data.map((visit) => (
                                                <tr key={visit.id} className="hover:bg-gray-50">
                                                    {/* Updated Date Format Here */}
                                                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(visit.created_at)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                        {visit.patient?.first_name} {visit.patient?.last_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-blue-600 font-semibold">{visit.timing}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 text-xs">
                                                        Lochia: {visit.lochia_status || '-'} <br/>
                                                        Vit A: {visit.vitamin_a_given ? 'Yes' : 'No'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {pncVisits.data.length === 0 && (
                                                <tr><td colSpan="4" className="text-center py-4 text-gray-500">No records found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4"><Pagination links={pncVisits.links} /></div>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}