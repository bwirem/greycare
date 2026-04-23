import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faFileExport } from '@fortawesome/free-solid-svg-icons';

export default function AncReport({ auth, reportData, filters }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('reports.rch.anc'), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">ANC Registration Report</h2>}>
            <Head title="ANC Registrations Report" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4 w-full md:w-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm" />
                            </div>
                            <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-md shadow hover:bg-pink-700 flex items-center">
                                <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filter
                            </button>
                        </form>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-pink-500">
                            <p className="text-sm text-gray-500 uppercase">New ANC Registrations</p>
                            <h3 className="text-3xl font-bold dark:text-white">{reportData.total_registrations}</h3>
                            <p className="text-xs text-gray-400 mt-1">Between {reportData.start} and {reportData.end}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-500">
                            <p className="text-sm text-gray-500 uppercase">Current Status</p>
                            <div className="mt-2 text-sm dark:text-gray-300">
                                {Object.entries(reportData.status_stats).map(([status, count]) => (
                                    <div key={status} className="flex justify-between py-1 border-b dark:border-gray-700 last:border-0">
                                        <span>{status}:</span> <span className="font-bold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-orange-500">
                            <p className="text-sm text-gray-500 uppercase">Parity Breakdown</p>
                            <div className="mt-2 text-sm dark:text-gray-300">
                                {Object.entries(reportData.parity_stats).map(([parity, count]) => (
                                    <div key={parity} className="flex justify-between py-1 border-b dark:border-gray-700 last:border-0">
                                        <span>{parity}:</span> <span className="font-bold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mother Info</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ANC #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gravida / Parity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EDD</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 text-sm">
                                    {reportData.rows.length > 0 ? (
                                        reportData.rows.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{row.reg_date}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">{row.mother_name}</div>
                                                    <div className="text-xs text-gray-500">{row.file_number}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">{row.anc_number}</td>
                                                <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold">{row.gravida_parity}</td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{row.edd}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                No ANC registrations found for the selected period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}