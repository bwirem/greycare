import React from 'react';
import AuthenticatedLayout from '@/Layouts/HumanResourceLayout';
import { Head, router } from '@inertiajs/react';

export default function PayrollSummary({ auth, periods, summary, selectedPeriod, filters }) {
    
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Payroll Summary</h2>}>
            <Head title="Payroll Report" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    <div className="bg-white p-4 rounded shadow mb-6 no-print flex gap-4 items-center">
                        <label className="font-bold">Select Period:</label>
                        <select 
                            value={filters.period_id || ''} 
                            onChange={(e) => router.get(route('reports.hr.payroll_summary'), { period_id: e.target.value })}
                            className="rounded border-gray-300 w-64"
                        >
                            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded ml-auto">Print</button>
                    </div>

                    {summary && (
                        <div className="bg-white p-8 rounded shadow">
                            <div className="text-center mb-6">
                                <h1 className="text-xl font-bold uppercase">Departmental Payroll Summary</h1>
                                <p className="text-gray-600">{selectedPeriod.name} ({selectedPeriod.start_date} - {selectedPeriod.end_date})</p>
                            </div>

                            <table className="w-full text-sm text-right border-collapse border border-gray-200">
                                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 text-left border">Department</th>
                                        <th className="px-4 py-3 border">Staff</th>
                                        <th className="px-4 py-3 border">Basic Pay</th>
                                        <th className="px-4 py-3 border">Allowances</th>
                                        <th className="px-4 py-3 border">Gross</th>
                                        <th className="px-4 py-3 border">Tax (PAYE)</th>
                                        <th className="px-4 py-3 border">Deductions</th>
                                        <th className="px-4 py-3 border bg-gray-200">Net Pay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.map((row, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="px-4 py-2 text-left font-bold border">{row.department_snapshot}</td>
                                            <td className="px-4 py-2 border">{row.emp_count}</td>
                                            <td className="px-4 py-2 border">{parseFloat(row.total_basic).toLocaleString()}</td>
                                            <td className="px-4 py-2 border">{parseFloat(row.total_allowances).toLocaleString()}</td>
                                            <td className="px-4 py-2 border font-semibold">{parseFloat(row.total_gross).toLocaleString()}</td>
                                            <td className="px-4 py-2 border text-red-600">{parseFloat(row.total_tax).toLocaleString()}</td>
                                            <td className="px-4 py-2 border text-red-600">{parseFloat(row.total_deductions).toLocaleString()}</td>
                                            <td className="px-4 py-2 border font-bold bg-blue-50">{parseFloat(row.total_net).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-800 text-white font-bold">
                                    <tr>
                                        <td className="px-4 py-3">TOTALS</td>
                                        <td className="px-4 py-3 text-right">{summary.reduce((a,b) => a + b.emp_count, 0)}</td>
                                        <td className="px-4 py-3 text-right">{summary.reduce((a,b) => a + parseFloat(b.total_basic), 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{summary.reduce((a,b) => a + parseFloat(b.total_allowances), 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{summary.reduce((a,b) => a + parseFloat(b.total_gross), 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{summary.reduce((a,b) => a + parseFloat(b.total_tax), 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{summary.reduce((a,b) => a + parseFloat(b.total_deductions), 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{summary.reduce((a,b) => a + parseFloat(b.total_net), 0).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}