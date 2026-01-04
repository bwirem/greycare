import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faFilter } from '@fortawesome/free-solid-svg-icons';

export default function DailyOpdReport({ auth, reportData, clinics, doctors, filters }) {
    const { data, setData, get, processing } = useForm({
        report_date: filters.report_date || new Date().toISOString().slice(0, 10),
        clinic_id: filters.clinic_id || '',
        doctor_id: filters.doctor_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        get(route('reports.opd.daily'), { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Daily OPD Registrations</h2>}
        >
            <Head title={`OPD Daily - ${reportData?.report_date_formatted || ''}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                        
                        {/* Filters */}
                        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                                <input
                                    type="date"
                                    value={data.report_date}
                                    onChange={e => setData('report_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Clinic</label>
                                <select
                                    value={data.clinic_id}
                                    onChange={e => setData('clinic_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                                >
                                    <option value="">All Clinics</option>
                                    {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor</label>
                                <select
                                    value={data.doctor_id}
                                    onChange={e => setData('doctor_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                                >
                                    <option value="">All Doctors</option>
                                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
                            >
                                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                Generate
                            </button>
                        </form>

                        {reportData && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 dark:border-gray-700">
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                        {reportData.report_date_formatted}
                                    </h3>
                                    <span className="text-gray-500">Total Visits: <strong className="text-gray-800 dark:text-white">{reportData.total_visits}</strong></span>
                                </div>

                                {/* Breakdown Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Visit Classification</h4>
                                        <div className="flex justify-between text-sm">
                                            <span>New Cases:</span> <span className="font-bold">{reportData.new_cases}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Revisits:</span> <span className="font-bold">{reportData.revisits}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Payer Breakdown</h4>
                                        {reportData.payment_breakdown.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm border-b border-dashed border-gray-300 dark:border-gray-600 last:border-0 py-1">
                                                <span>{item.payer_name}</span>
                                                <span className="font-bold">{item.count}</span>
                                            </div>
                                        ))}
                                        {reportData.payment_breakdown.length === 0 && <span className="text-sm text-gray-400">No data</span>}
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Time</th>
                                                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">File No</th>
                                                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Patient Name</th>
                                                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Age/Sex</th>
                                                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Clinic</th>
                                                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Doctor</th>
                                                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Payer</th>
                                                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {reportData.detailed_visits.map((visit) => (
                                                <tr key={visit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{visit.time}</td>
                                                    <td className="px-4 py-2 text-sm text-indigo-600 font-medium whitespace-nowrap">{visit.file_number}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{visit.patient_name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{visit.age} / {visit.gender.charAt(0)}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{visit.clinic}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 text-xs">{visit.doctor}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                                                        <span className={`px-2 py-0.5 rounded text-xs ${visit.payer === 'Cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                            {visit.payer}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{visit.type}</td>
                                                </tr>
                                            ))}
                                            {reportData.detailed_visits.length === 0 && (
                                                <tr>
                                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">No registrations found for this date.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}