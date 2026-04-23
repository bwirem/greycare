import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faFileExport } from '@fortawesome/free-solid-svg-icons';

export default function DeliveriesReport({ auth, reportData, filters }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('reports.rch.deliveries'), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Deliveries Report</h2>}>
            <Head title="Deliveries Report" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <form onSubmit={handleFilter} className="flex gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block rounded-md border-gray-300 shadow-sm sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block rounded-md border-gray-300 shadow-sm sm:text-sm" />
                            </div>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 flex items-center">
                                <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filter
                            </button>
                        </form>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
                            <p className="text-sm text-gray-500 uppercase">Total Deliveries</p>
                            <h3 className="text-3xl font-bold">{reportData.total_deliveries}</h3>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-pink-500">
                            <p className="text-sm text-gray-500 uppercase">Mode of Delivery</p>
                            <div className="mt-2 text-sm">
                                {Object.entries(reportData.mode_stats).map(([mode, count]) => (
                                    <div key={mode} className="flex justify-between"><span>{mode}:</span> <span className="font-bold">{count}</span></div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
                            <p className="text-sm text-gray-500 uppercase">Outcomes</p>
                            <div className="mt-2 text-sm">
                                {Object.entries(reportData.outcome_stats).map(([outcome, count]) => (
                                    <div key={outcome} className="flex justify-between"><span>{outcome}:</span> <span className="font-bold">{count}</span></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mother Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender / Wt</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apgar (1/5)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 text-sm">
                                {reportData.rows.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap">{row.date}</td>
                                        <td className="px-6 py-4"><div>{row.mother_name}</div><div className="text-xs text-gray-500">{row.file_number}</div></td>
                                        <td className="px-6 py-4">{row.mode}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.outcome.toLowerCase() === 'live' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {row.outcome}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{row.gender} / {row.weight}kg</td>
                                        <td className="px-6 py-4">{row.apgar}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}