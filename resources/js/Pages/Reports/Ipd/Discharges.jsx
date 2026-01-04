import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPrint } from '@fortawesome/free-solid-svg-icons';

export default function IpdDischargesReport({ auth, reportData, statuses, filters }) {
    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
        status_id: filters.status_id || ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('reports.ipd.discharges'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Discharges Report</h2>}>
            <Head title="Discharges Log" />
            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow mb-6 print:hidden">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="rounded-md border-gray-300 w-full" />
                        <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="rounded-md border-gray-300 w-full" />
                        <select value={data.status_id} onChange={e => setData('status_id', e.target.value)} className="rounded-md border-gray-300 w-full">
                            <option value="">All Outcomes</option>
                            {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                <div className="bg-white shadow rounded-lg p-8 print:shadow-none print:p-0">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold uppercase">Inpatient Discharges Log</h1>
                        <p className="text-gray-600">Period: {reportData.start} to {reportData.end}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mb-6 border-b pb-6">
                        <div className="bg-gray-100 p-3 rounded">
                            <span className="text-xs uppercase font-bold text-gray-500">Total</span>
                            <span className="block text-lg font-bold">{reportData.total_discharges}</span>
                        </div>
                        {reportData.outcome_stats.map((s, i) => (
                            <div key={i} className="bg-blue-50 p-3 rounded">
                                <span className="text-xs uppercase font-bold text-gray-500">{s.name}</span>
                                <span className="block text-lg font-bold">{s.total}</span>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left font-bold">Discharge Date</th>
                                    <th className="px-4 py-2 text-left font-bold">File No</th>
                                    <th className="px-4 py-2 text-left font-bold">Patient Name</th>
                                    <th className="px-4 py-2 text-left font-bold">Ward</th>
                                    <th className="px-4 py-2 text-left font-bold">Outcome</th>
                                    <th className="px-4 py-2 text-right font-bold">L.O.S (Days)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportData.rows.map(row => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                                        <td className="px-4 py-2 font-medium text-indigo-600">{row.file_number}</td>
                                        <td className="px-4 py-2">{row.patient_name}</td>
                                        <td className="px-4 py-2">{row.ward}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${row.outcome === 'Death' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {row.outcome}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right">{row.los}</td>
                                    </tr>
                                ))}
                                {reportData.rows.length === 0 && <tr><td colSpan="6" className="text-center py-4">No records found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}