import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPrint } from '@fortawesome/free-solid-svg-icons';

export default function TheatreAnalysisReport({ auth, reportData, filters }) {
    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('reports.theatre.analysis'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Procedure Analysis</h2>}>
            <Head title="Surgery Analysis" />
            <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 print:hidden">
                    <form onSubmit={handleSearch} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-sm text-gray-500">Start Date</label>
                            <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm text-gray-500">End Date</label>
                            <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <button disabled={processing} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                            <FontAwesomeIcon icon={faFilter} className="mr-2"/> Generate
                        </button>
                        <button type="button" onClick={() => window.print()} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                            <FontAwesomeIcon icon={faPrint} />
                        </button>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 print:shadow-none print:p-0">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold uppercase text-gray-800 dark:text-white">Surgery Volume Analysis</h1>
                        <p className="text-gray-600 dark:text-gray-400">Top 20 Procedures | Period: {reportData.start} to {reportData.end}</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-red-50 dark:bg-red-900/30">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-red-800 dark:text-red-200 uppercase tracking-wider">Procedure Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-red-800 dark:text-red-200 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-red-800 dark:text-red-200 uppercase tracking-wider">Scheduled</th>
                                    <th className="px-6 py-3 text-center text-xs font-bold text-red-800 dark:text-red-200 uppercase tracking-wider">Completed</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-red-800 dark:text-red-200 uppercase tracking-wider">Completion Rate</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {reportData.volumes.map((row, i) => {
                                    const rate = row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0;
                                    return (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{row.name}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{row.category || '-'}</td>
                                            <td className="px-6 py-4 text-center text-gray-800 dark:text-gray-200">{row.total}</td>
                                            <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-bold">{row.completed}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs font-bold text-gray-500">{rate}%</span>
                                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${rate}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}