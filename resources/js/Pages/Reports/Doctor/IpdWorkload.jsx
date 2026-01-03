import AuthenticatedLayout from '@/Layouts/FinanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPrint } from '@fortawesome/free-solid-svg-icons';

export default function IpdWorkloadReport({ auth, reportData, wards, filters }) {
    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
        ward_id: filters.ward_id || ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('reports.doctor.ipd_workload'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">IPD Ward Rounds</h2>}>
            <Head title="IPD Rounds" />
            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow mb-6 print:hidden">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="rounded-md border-gray-300 w-full" />
                        <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="rounded-md border-gray-300 w-full" />
                        <select value={data.ward_id} onChange={e => setData('ward_id', e.target.value)} className="rounded-md border-gray-300 w-full">
                            <option value="">All Wards</option>
                            {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
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

                {/* Report Sheet */}
                <div className="bg-white shadow rounded-lg p-8 print:shadow-none print:p-0">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold uppercase">IPD Ward Rounds Activity</h1>
                        <p className="text-gray-600">Period: {reportData.start} to {reportData.end}</p>
                    </div>

                    {/* Summary */}
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-700 mb-2 uppercase border-b pb-1">Activity Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {reportData.summary.map((stat, idx) => (
                                <div key={idx} className="bg-green-50 p-3 rounded border border-green-100">
                                    <span className="block text-xs text-gray-500 uppercase">{stat.doctor_name}</span>
                                    <span className="block text-xl font-bold text-green-700">{stat.count} <span className="text-sm font-normal text-gray-400">Rounds</span></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detail Table */}
                    <h3 className="font-bold text-gray-700 mb-2 uppercase border-b pb-1">Ward Rounds Log</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left font-bold">Date/Time</th>
                                    <th className="px-4 py-2 text-left font-bold">Doctor</th>
                                    <th className="px-4 py-2 text-left font-bold">Patient</th>
                                    <th className="px-4 py-2 text-left font-bold">Ward</th>
                                    <th className="px-4 py-2 text-left font-bold">Clinical Note Preview</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportData.rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                                        <td className="px-4 py-2 font-medium text-indigo-600">{row.doctor_name}</td>
                                        <td className="px-4 py-2">{row.patient_name}</td>
                                        <td className="px-4 py-2">{row.ward}</td>
                                        <td className="px-4 py-2 italic text-gray-500 text-xs">"{row.notes_excerpt}..."</td>
                                    </tr>
                                ))}
                                {reportData.rows.length === 0 && (
                                    <tr><td colSpan="5" className="text-center py-4 text-gray-500">No rounds found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}