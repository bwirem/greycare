import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/SpecializedLayout';
import { Head, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSyringe } from '@fortawesome/free-solid-svg-icons';

export default function ImmunizationsReport({ auth, reportData, filters = {} }) {
    // Using filters?.start_date safely prevents the undefined error
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('reports.rch.immunizations'), { 
            start_date: startDate, 
            end_date: endDate 
        }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Immunizations Report</h2>}>
            <Head title="Immunizations Report" />

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
                            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 flex items-center">
                                <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filter
                            </button>
                        </form>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                    <FontAwesomeIcon icon={faSyringe} className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase">Total Doses Administered</p>
                                    <h3 className="text-3xl font-bold dark:text-white">{reportData.total_vaccines}</h3>
                                    <p className="text-xs text-gray-400 mt-1">Between {reportData.start} and {reportData.end}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
                            <p className="text-sm text-gray-500 uppercase">Vaccines Breakdown</p>
                            <div className="mt-2 text-sm dark:text-gray-300 h-24 overflow-y-auto pr-2">
                                {reportData.vaccine_stats.length > 0 ? reportData.vaccine_stats.map((stat, idx) => (
                                    <div key={idx} className="flex justify-between py-1 border-b dark:border-gray-700 last:border-0">
                                        <span>{stat.name}:</span> <span className="font-bold">{stat.total}</span>
                                    </div>
                                )) : <p className="text-gray-500 italic">No data</p>}
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child Info</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaccine</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age at Admin</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 text-sm">
                                    {reportData.rows.length > 0 ? (
                                        reportData.rows.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{row.date}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">{row.child_name}</div>
                                                    <div className="text-xs text-gray-500">{row.file_number}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">
                                                        {row.vaccine}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">{row.batch}</td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{row.age_at_admin}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No immunizations found for the selected period.
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