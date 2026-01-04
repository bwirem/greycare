import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPrint } from '@fortawesome/free-solid-svg-icons';

export default function DailyCensusReport({ auth, reportData, filters }) {
    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('reports.ipd.daily_census'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold">IPD Daily Census Summary</h2>}
        >
            <Head title="Daily Census" />

            <div className="py-12">
                <div className="mx-auto max-w-[95%] sm:px-6 lg:px-8">
                    
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg shadow mb-6 print:hidden">
                        <form onSubmit={handleSearch} className="flex gap-4 items-end">
                            <div className="w-48">
                                <label className="text-sm font-bold">Start Date</label>
                                <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="w-full border-gray-300 rounded" />
                            </div>
                            <div className="w-48">
                                <label className="text-sm font-bold">End Date</label>
                                <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="w-full border-gray-300 rounded" />
                            </div>
                            <button disabled={processing} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                <FontAwesomeIcon icon={faFilter} className="mr-2"/> Generate
                            </button>
                            <button type="button" onClick={() => window.print()} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-auto">
                                <FontAwesomeIcon icon={faPrint} /> Print
                            </button>
                        </form>
                    </div>

                    {/* Report Sheet */}
                    <div className="bg-white shadow p-8 print:shadow-none print:p-0 text-xs">
                        
                        {/* Header Info */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold uppercase">IPD Daily Census - Summary</h1>
                            <p className="mt-2">Period: <strong>{reportData.start}</strong> to <strong>{reportData.end}</strong></p>
                        </div>

                        {/* PART 1: Movement Table (Admissions, Discharges, Deaths, etc) */}
                        <div className="overflow-x-auto border border-black mb-8">
                            <table className="min-w-full divide-y divide-black border-collapse">
                                <thead className="bg-gray-200 print:bg-gray-200">
                                    {/* Row 1: High Level Categories */}
                                    <tr>
                                        <th rowSpan="2" className="border border-black px-2 py-1 w-32 text-left">WARD</th>
                                        <th colSpan="3" className="border border-black px-2 py-1 text-center">ADMISSIONS</th>
                                        <th colSpan="3" className="border border-black px-2 py-1 text-center">DISCHARGES</th>
                                        <th colSpan="3" className="border border-black px-2 py-1 text-center">DEATH</th>
                                        <th colSpan="3" className="border border-black px-2 py-1 text-center">ABSCONDEE</th>
                                        <th colSpan="2" className="border border-black px-2 py-1 text-center">TRANSFERS</th>
                                    </tr>
                                    {/* Row 2: M/F/T Breakdown */}
                                    <tr>
                                        {/* Admins */}
                                        <th className="border border-black px-1 py-1 text-center w-10">M</th>
                                        <th className="border border-black px-1 py-1 text-center w-10">F</th>
                                        <th className="border border-black px-1 py-1 text-center w-12 bg-gray-300">TOTAL</th>
                                        {/* Discharges */}
                                        <th className="border border-black px-1 py-1 text-center w-10">M</th>
                                        <th className="border border-black px-1 py-1 text-center w-10">F</th>
                                        <th className="border border-black px-1 py-1 text-center w-12 bg-gray-300">TOTAL</th>
                                        {/* Death */}
                                        <th className="border border-black px-1 py-1 text-center w-10">M</th>
                                        <th className="border border-black px-1 py-1 text-center w-10">F</th>
                                        <th className="border border-black px-1 py-1 text-center w-12 bg-gray-300">TOTAL</th>
                                        {/* Absc */}
                                        <th className="border border-black px-1 py-1 text-center w-10">M</th>
                                        <th className="border border-black px-1 py-1 text-center w-10">F</th>
                                        <th className="border border-black px-1 py-1 text-center w-12 bg-gray-300">TOTAL</th>
                                        {/* Trans */}
                                        <th className="border border-black px-1 py-1 text-center w-12">IN</th>
                                        <th className="border border-black px-1 py-1 text-center w-12">OUT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.rows.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="border border-black px-2 py-1 font-bold">{row.ward_name}</td>
                                            
                                            <td className="border border-black px-1 py-1 text-center">{row.admin_male}</td>
                                            <td className="border border-black px-1 py-1 text-center">{row.admin_female}</td>
                                            <td className="border border-black px-1 py-1 text-center font-bold bg-gray-100">{row.admin_total}</td>

                                            <td className="border border-black px-1 py-1 text-center">{row.disch_male}</td>
                                            <td className="border border-black px-1 py-1 text-center">{row.disch_female}</td>
                                            <td className="border border-black px-1 py-1 text-center font-bold bg-gray-100">{row.disch_total}</td>

                                            <td className="border border-black px-1 py-1 text-center">{row.death_male}</td>
                                            <td className="border border-black px-1 py-1 text-center">{row.death_female}</td>
                                            <td className="border border-black px-1 py-1 text-center font-bold bg-gray-100">{row.death_total}</td>

                                            <td className="border border-black px-1 py-1 text-center">{row.absc_male}</td>
                                            <td className="border border-black px-1 py-1 text-center">{row.absc_female}</td>
                                            <td className="border border-black px-1 py-1 text-center font-bold bg-gray-100">{row.absc_total}</td>

                                            <td className="border border-black px-1 py-1 text-center">{row.trans_in}</td>
                                            <td className="border border-black px-1 py-1 text-center">{row.trans_out}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-300 font-bold border-t-2 border-black">
                                    <tr>
                                        <td className="border border-black px-2 py-1">TOTAL</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.admin_male}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.admin_female}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.admin_total}</td>

                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.disch_male}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.disch_female}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.disch_total}</td>

                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.death_male}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.death_female}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.death_total}</td>

                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.absc_male}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.absc_female}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.absc_total}</td>

                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.trans_in}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.trans_out}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* PART 2: Patient Days & Occupancy (Matches DetailReport1) */}
                        <h2 className="text-lg font-bold mb-2 uppercase border-b-2 border-black inline-block">Patient Days & Bed Occupancy</h2>
                        <div className="overflow-x-auto border border-black max-w-4xl">
                            <table className="min-w-full divide-y divide-black border-collapse">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th rowSpan="2" className="border border-black px-2 py-1 w-48 text-left">WARD</th>
                                        <th colSpan="3" className="border border-black px-2 py-1 text-center">PATIENT DAYS</th>
                                        <th rowSpan="2" className="border border-black px-2 py-1 text-center w-24">No. OF BEDS</th>
                                        <th rowSpan="2" className="border border-black px-2 py-1 text-center w-24">BED OCCUP. %</th>
                                    </tr>
                                    <tr>
                                        <th className="border border-black px-1 py-1 text-center w-16">M</th>
                                        <th className="border border-black px-1 py-1 text-center w-16">F</th>
                                        <th className="border border-black px-1 py-1 text-center w-20 bg-gray-300">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.rows.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="border border-black px-2 py-1 font-bold">{row.ward_name}</td>
                                            <td className="border border-black px-1 py-1 text-center">{row.days_male}</td>
                                            <td className="border border-black px-1 py-1 text-center">{row.days_female}</td>
                                            <td className="border border-black px-1 py-1 text-center font-bold bg-gray-100">{row.days_total}</td>
                                            <td className="border border-black px-1 py-1 text-center">{row.total_beds}</td>
                                            <td className="border border-black px-1 py-1 text-center font-bold">
                                                {row.occupancy.toFixed(2)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-300 font-bold border-t-2 border-black">
                                    <tr>
                                        <td className="border border-black px-2 py-1">TOTAL</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.days_male}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.days_female}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.days_total}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.total_beds}</td>
                                        <td className="border border-black px-1 py-1 text-center">{reportData.totals.occupancy.toFixed(2)}%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}