import AuthenticatedLayout from '@/Layouts/HospitalLayout';
import { Head, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPrint } from '@fortawesome/free-solid-svg-icons';

export default function OpdAttendanceReport({ auth, reportData, filters }) {
    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        group_by: filters.group_by || 'clinic',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('reports.opd.attendance'), { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">OPD Attendance Matrix</h2>}
        >
            <Head title="Attendance Report" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Controls (Hidden on Print) */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6 mb-6 print:hidden">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                <input 
                                    type="date" 
                                    value={data.start_date} 
                                    onChange={e => setData('start_date', e.target.value)} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                <input 
                                    type="date" 
                                    value={data.end_date} 
                                    onChange={e => setData('end_date', e.target.value)} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group By</label>
                                <select 
                                    value={data.group_by} 
                                    onChange={e => setData('group_by', e.target.value)} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
                                >
                                    <option value="clinic">Treatment Points (Clinics)</option>
                                    <option value="payer">Customer Groups (Billing)</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={processing} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex-1">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2"/> Generate
                                </button>
                                <button type="button" onClick={handlePrint} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                                    <FontAwesomeIcon icon={faPrint} />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Report Sheet */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-8 print:shadow-none print:p-0">
                        
                        {/* Report Header */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase">{reportData.title}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Period: <span className="font-semibold">{reportData.start}</span> to <span className="font-semibold">{reportData.end}</span>
                            </p>
                        </div>

                        {/* Complex Table Structure mirroring DevExpress table1/table2 */}
                        <div className="overflow-x-auto border border-gray-300 dark:border-gray-600">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 border-collapse">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    {/* Top Header Row */}
                                    <tr>
                                        <th rowSpan="2" className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs font-bold text-gray-900 dark:text-white uppercase w-1/4">
                                            {data.group_by === 'clinic' ? 'Treatment Point' : 'Customer Group'}
                                        </th>
                                        <th colSpan="3" className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-bold text-gray-900 dark:text-white uppercase bg-blue-50 dark:bg-blue-900/30">
                                            New Cases
                                        </th>
                                        <th colSpan="3" className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-bold text-gray-900 dark:text-white uppercase bg-green-50 dark:bg-green-900/30">
                                            Re-Attendance
                                        </th>
                                        <th colSpan="3" className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-xs font-bold text-gray-900 dark:text-white uppercase bg-gray-200 dark:bg-gray-600">
                                            Totals
                                        </th>
                                    </tr>
                                    {/* Sub Header Row (M/F/T) */}
                                    <tr>
                                        {/* New */}
                                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30">Male</th>
                                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30">Female</th>
                                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-bold text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900/50">Total</th>
                                        
                                        {/* Revisit */}
                                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/30">Male</th>
                                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/30">Female</th>
                                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-bold text-gray-900 dark:text-white bg-green-100 dark:bg-green-900/50">Total</th>

                                        {/* Grand */}
                                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600">Male</th>
                                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600">Female</th>
                                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-xs font-bold text-gray-900 dark:text-white bg-gray-300 dark:bg-gray-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                    {reportData.rows.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                                {row.group_name}
                                            </td>
                                            
                                            {/* New Data */}
                                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-center text-gray-600 dark:text-gray-300">{row.new_male}</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-center text-gray-600 dark:text-gray-300">{row.new_female}</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20">{row.new_total}</td>
                                            
                                            {/* Revisit Data */}
                                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-center text-gray-600 dark:text-gray-300">{row.revisit_male}</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-center text-gray-600 dark:text-gray-300">{row.revisit_female}</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-center font-bold text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-900/20">{row.revisit_total}</td>
                                            
                                            {/* Total Data */}
                                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-center text-gray-600 dark:text-gray-300">{row.total_male}</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-center text-gray-600 dark:text-gray-300">{row.total_female}</td>
                                            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-center font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700">{row.grand_total}</td>
                                        </tr>
                                    ))}
                                    {reportData.rows.length === 0 && (
                                        <tr>
                                            <td colSpan="10" className="px-3 py-8 text-center text-gray-500">No data found for this period.</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold border-t-2 border-gray-400">
                                    <tr>
                                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left uppercase">Totals</td>
                                        
                                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{reportData.totals.new_male}</td>
                                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{reportData.totals.new_female}</td>
                                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{reportData.totals.new_total}</td>
                                        
                                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{reportData.totals.revisit_male}</td>
                                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{reportData.totals.revisit_female}</td>
                                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{reportData.totals.revisit_total}</td>
                                        
                                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{reportData.totals.total_male}</td>
                                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{reportData.totals.total_female}</td>
                                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{reportData.totals.grand_total}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        {/* Footer Info (Printed Date) */}
                        <div className="mt-4 text-xs text-gray-500 text-right print:block hidden">
                            Printed on: {new Date().toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}