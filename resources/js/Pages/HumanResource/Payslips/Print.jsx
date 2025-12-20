import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

export default function Print({ slip }) {
    
    useEffect(() => {
        window.print();
    }, []);

    const earnings = slip.items.filter(item => item.type === 'Earning');
    const deductions = slip.items.filter(item => item.type === 'Deduction' || item.type === 'Tax');

    return (
        <div className="bg-white text-black p-8 max-w-3xl mx-auto font-sans">
            <Head title={`Print Payslip - ${slip.employee.first_name}`} />
            
            {/* Header */}
            <div className="flex justify-between border-b-2 border-black pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">GREYCARE HOSPITAL</h1>
                    <p className="text-sm">Human Resources Department</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase">Payslip</h2>
                    <p>{slip.payroll_period?.name}</p>
                </div>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <p><strong>Name:</strong> {slip.employee.first_name} {slip.employee.last_name}</p>
                    <p><strong>Staff ID:</strong> {slip.employee.employee_code}</p>
                </div>
                <div className="text-right">
                    <p><strong>Department:</strong> {slip.department_snapshot}</p>
                    <p><strong>Designation:</strong> {slip.job_title_snapshot}</p>
                </div>
            </div>

            {/* Content Table */}
            <div className="border border-black mb-6">
                <div className="grid grid-cols-2">
                    {/* Earnings */}
                    <div className="border-r border-black p-4">
                        <h3 className="font-bold underline mb-2">Earnings</h3>
                        <table className="w-full text-sm">
                            <tbody>
                                {earnings.map(item => (
                                    <tr key={item.id}>
                                        <td className="py-1">{item.name}</td>
                                        <td className="py-1 text-right">{parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Deductions */}
                    <div className="p-4">
                        <h3 className="font-bold underline mb-2">Deductions</h3>
                        <table className="w-full text-sm">
                            <tbody>
                                {deductions.map(item => (
                                    <tr key={item.id}>
                                        <td className="py-1">{item.name}</td>
                                        <td className="py-1 text-right">{parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals Row */}
                <div className="grid grid-cols-2 border-t border-black bg-gray-100">
                    <div className="border-r border-black p-2 flex justify-between font-bold text-sm">
                        <span>Total Earnings</span>
                        <span>{parseFloat(slip.gross_salary).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="p-2 flex justify-between font-bold text-sm">
                        <span>Total Deductions</span>
                        <span>{parseFloat(slip.total_deductions).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
            </div>

            {/* Net Pay */}
            <div className="flex justify-end mb-12">
                <div className="border-2 border-black p-4 text-center min-w-[200px]">
                    <span className="block text-sm font-bold uppercase">Net Pay</span>
                    <span className="block text-xl font-bold">{parseFloat(slip.net_pay).toLocaleString(undefined, {style: 'currency', currency: 'KES'})}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="grid grid-cols-2 gap-12 text-sm pt-12">
                <div className="border-t border-black pt-2 text-center">
                    Employer Signature
                </div>
                <div className="border-t border-black pt-2 text-center">
                    Employee Signature
                </div>
            </div>
        </div>
    );
}