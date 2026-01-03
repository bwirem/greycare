import AuthenticatedLayout from '@/Layouts/FinanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPrint } from '@fortawesome/free-solid-svg-icons';

export default function OpdWorkloadReport({ auth, reportData, doctors, filters }) {
    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
        doctor_id: filters.doctor_id || ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('reports.doctor.opd_workload'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">OPD Workload</h2>}>
            <Head title="OPD Workload" />
            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow mb-6 print:hidden">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="rounded-md border-gray-300 w-full" />
                        <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="rounded-md border-gray-300 w-full" />
                        <select value={data.doctor_id} onChange={e => setData('doctor_id', e.target.value)} className="rounded-md border-gray-300 w-full">
                            <option value="">All Doctors</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
                        <h1 className="text-2xl font-bold uppercase">OPD Doctor Workload</h1>
                        <p className="text-gray-600">Period: {reportData.start} to {reportData.end}</p>
                    </div>

                    {/* Summary by Doctor */}
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-700 mb-2 uppercase border-b pb-1">Performance Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {reportData.summary.map((stat, idx) => (
                                <div key={idx} className="bg-blue-50 p-3 rounded border border-blue-100">
                                    <span className="block text-xs text-gray-500 uppercase">{stat.doctor_name}</span>
                                    <span className="block text-xl font-bold text-blue-700">{stat.count} <span className="text-sm font-normal text-gray-400">Patients</span></span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Log */}
                    <h3 className="font-bold text-gray-700 mb-2 uppercase border-b pb-1">Patient Detail Log</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left font-bold">Date/Time</th>
                                    <th className="px-4 py-2 text-left font-bold">Doctor</th>
                                    <th className="px-4 py-2 text-left font-bold">File No</th>
                                    <th className="px-4 py-2 text-left font-bold">Patient Name</th>
                                    <th className="px-4 py-2 text-left font-bold">Clinic</th>
                                    <th className="px-4 py-2 text-left font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportData.rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                                        <td className="px-4 py-2 font-medium text-indigo-600">{row.doctor_name}</td>
                                        <td className="px-4 py-2 font-mono">{row.file_number}</td>
                                        <td className="px-4 py-2">{row.patient_name}</td>
                                        <td className="px-4 py-2">{row.clinic}</td>
                                        <td className="px-4 py-2">
                                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 border">{row.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {reportData.rows.length === 0 && (
                                    <tr><td colSpan="6" className="text-center py-4 text-gray-500">No records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}