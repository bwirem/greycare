import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPrint } from '@fortawesome/free-solid-svg-icons';

export default function TheatreActivityReport({ auth, reportData, surgeons, filters }) {
    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        status: filters.status || '',
        doctor_id: filters.doctor_id || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('reports.theatre.activity'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Surgery Activity Log</h2>}>
            <Head title="Surgery Activity" />
            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 print:hidden">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                        <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                        
                        <select value={data.status} onChange={e => setData('status', e.target.value)} className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                            <option value="">All Statuses</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Recovery">Recovery</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        <select value={data.doctor_id} onChange={e => setData('doctor_id', e.target.value)} className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                            <option value="">All Surgeons</option>
                            {surgeons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>

                        <div className="flex gap-2">
                            <button disabled={processing} className="bg-indigo-600 text-white px-4 py-2 rounded flex-1 hover:bg-indigo-700">
                                <FontAwesomeIcon icon={faFilter} className="mr-2"/> Filter
                            </button>
                            <button type="button" onClick={() => window.print()} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                                <FontAwesomeIcon icon={faPrint} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Report Content */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 print:shadow-none print:p-0">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold uppercase text-gray-800 dark:text-white">Surgery Activity Log</h1>
                        <p className="text-gray-600 dark:text-gray-400">Period: {reportData.start} to {reportData.end}</p>
                    </div>

                    {/* Summary Row */}
                    <div className="flex flex-wrap gap-4 mb-6 border-b dark:border-gray-700 pb-6">
                        {reportData.summary.map((stat, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                                <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">{stat.status}</span>
                                <span className="block text-lg font-bold text-gray-800 dark:text-white">{stat.total}</span>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">Scheduled Date</th>
                                    <th className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">File No</th>
                                    <th className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">Patient</th>
                                    <th className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">Procedure</th>
                                    <th className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">Surgeon</th>
                                    <th className="px-4 py-2 text-center font-bold text-gray-700 dark:text-gray-300">Status</th>
                                    <th className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-300">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {reportData.rows.data.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">{row.date}</td>
                                        <td className="px-4 py-2 font-mono text-xs text-indigo-600 dark:text-indigo-400">{row.file_number}</td>
                                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{row.patient_name}</td>
                                        <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">{row.procedure}</td>
                                        <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{row.surgeon}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                                row.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                                row.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                                                'bg-blue-50 text-blue-800 border-blue-200'
                                            }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{row.remarks}</td>
                                    </tr>
                                ))}
                                {reportData.rows.data.length === 0 && <tr><td colSpan="7" className="text-center py-4 text-gray-500">No records found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="mt-4 print:hidden">
                        {reportData.rows.links && (
                            <div className="flex gap-1 justify-center text-xs">
                                {reportData.rows.links.map((link, k) => (
                                    <Link 
                                        key={k} 
                                        href={link.url || '#'} 
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2 py-1 border rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}