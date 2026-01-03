import AuthenticatedLayout from '@/Layouts/FinanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export default function OpdSummaryReport({ auth, reportData, filters }) {
    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        group_by: filters.group_by || 'day',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('reports.opd.summary'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">OPD Summary Report</h2>}>
            <Head title="OPD Summary" />
            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="text-sm">Start Date</label>
                            <input type="date" value={data.start_date} onChange={e=>setData('start_date', e.target.value)} className="w-full border-gray-300 rounded" />
                        </div>
                        <div>
                            <label className="text-sm">End Date</label>
                            <input type="date" value={data.end_date} onChange={e=>setData('end_date', e.target.value)} className="w-full border-gray-300 rounded" />
                        </div>
                        <div>
                            <label className="text-sm">Group By</label>
                            <select value={data.group_by} onChange={e=>setData('group_by', e.target.value)} className="w-full border-gray-300 rounded">
                                <option value="day">Day</option>
                                <option value="month">Month</option>
                                <option value="clinic">Clinic</option>
                            </select>
                        </div>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                            <FontAwesomeIcon icon={faSearch} className="mr-2"/> Filter
                        </button>
                    </form>
                </div>

                {/* Simple Bar Chart Visualization (using standard HTML/CSS for simplicity) */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">{reportData.title}</h3>
                    <div className="mb-4 text-3xl font-bold text-indigo-600">{reportData.overall_total} <span className="text-sm text-gray-500 font-normal">Total Visits</span></div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group (Period/Clinic)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Visits</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.table_data.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.label}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{row.total}</td>
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