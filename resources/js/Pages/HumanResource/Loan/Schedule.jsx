import React from 'react';
import { Link } from '@inertiajs/react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPrint } from '@fortawesome/free-solid-svg-icons';

export default function Schedule({ auth, loan, schedule }) {
    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Repayment Schedule</h2>}>
            <Head title="Schedule" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-6 flex items-center justify-between border-b pb-4">
                            <div>
                                <h3 className="text-lg font-bold">{loan.employee.first_name}'s Loan Projection</h3>
                                <p className="text-sm text-gray-500">Ref: {loan.loan_reference}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => window.print()} className="bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 text-sm">
                                    <FontAwesomeIcon icon={faPrint} /> Print
                                </button>
                                <Link href={route('humanresurces2.index')} className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 text-sm">
                                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                                </Link>
                            </div>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200 border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Period</th>
                                    <th className="px-4 py-2 text-right">Deduction Amount</th>
                                    <th className="px-4 py-2 text-right">Remaining Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-4 py-2">{row.date}</td>
                                        <td className="px-4 py-2 text-right font-mono">{row.amount.toLocaleString()}</td>
                                        <td className="px-4 py-2 text-right font-mono font-bold text-gray-700">{row.balance.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="mt-4 p-4 bg-yellow-50 text-xs text-yellow-700 rounded">
                            * This is a projection based on current balance and installment settings. Actual deductions may vary based on payroll processing dates.
                        </div>
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}