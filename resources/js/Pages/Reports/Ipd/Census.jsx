import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPrint } from '@fortawesome/free-solid-svg-icons';

export default function IpdCensusReport({ auth, rows, ward_stats, wards, filters }) {
    const { data, setData, get } = useForm({
        ward_id: filters.ward_id || ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('reports.ipd.census'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Current Census</h2>}>
            <Head title="Bed Occupancy" />
            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Control Panel */}
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <select value={data.ward_id} onChange={e => setData('ward_id', e.target.value)} className="rounded-md border-gray-300">
                            <option value="">All Wards</option>
                            {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                            <FontAwesomeIcon icon={faFilter} className="mr-2"/> Filter
                        </button>
                    </form>
                    <button onClick={() => window.print()} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                        <FontAwesomeIcon icon={faPrint} className="mr-2"/> Print Report
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg p-8 print:shadow-none print:p-0">
                    <h1 className="text-2xl font-bold uppercase text-center mb-8">Current Ward Census & Occupancy</h1>

                    {/* Occupancy Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {ward_stats.map((stat, i) => (
                            <div key={i} className="border rounded p-4 bg-gray-50 flex flex-col">
                                <span className="font-bold text-lg text-gray-700">{stat.ward_name}</span>
                                <div className="mt-2 flex justify-between items-end">
                                    <div>
                                        <span className="text-gray-500 text-xs uppercase block">Occupied / Total</span>
                                        <span className="text-xl font-bold">{stat.occupied} <span className="text-gray-400 text-sm">/ {stat.total_beds}</span></span>
                                    </div>
                                    <span className={`text-lg font-bold ${stat.percent > 90 ? 'text-red-600' : 'text-green-600'}`}>
                                        {stat.percent}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div className={`h-2.5 rounded-full ${stat.percent > 90 ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${stat.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Patient List */}
                    <h3 className="text-lg font-bold mb-4 uppercase text-gray-600">Patient Detail List</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm border">
                            <thead className="bg-gray-800 text-white print:bg-gray-200 print:text-black">
                                <tr>
                                    <th className="px-4 py-2 text-left">Ward</th>
                                    <th className="px-4 py-2 text-left">Bed</th>
                                    <th className="px-4 py-2 text-left">File No</th>
                                    <th className="px-4 py-2 text-left">Patient Name</th>
                                    <th className="px-4 py-2 text-left">Payer</th>
                                    <th className="px-4 py-2 text-left">Admission Date</th>
                                    <th className="px-4 py-2 text-right">Days</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {rows.map(row => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-2 font-bold text-gray-700">{row.ward}</td>
                                        <td className="px-4 py-2">{row.bed}</td>
                                        <td className="px-4 py-2 font-mono text-indigo-600">{row.file_number}</td>
                                        <td className="px-4 py-2">{row.patient_name}</td>
                                        <td className="px-4 py-2">{row.payer}</td>
                                        <td className="px-4 py-2">{row.admission_date}</td>
                                        <td className="px-4 py-2 text-right font-bold">{row.days_admitted}</td>
                                    </tr>
                                ))}
                                {rows.length === 0 && <tr><td colSpan="7" className="text-center py-4">No patients currently admitted in selected ward.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}