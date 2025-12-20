import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Show({ auth, slip }) {
    
    // Separate earnings and deductions
    const earnings = slip.items.filter(item => item.type === 'Earning');
    const deductions = slip.items.filter(item => item.type === 'Deduction');
    const taxes = slip.items.filter(item => item.type === 'Tax');

    const handleEmail = () => {
        if(confirm('Send this payslip to the employee via email?')) {
            router.get(route('humanresurces4.email', slip.id));
        }
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">View Payslip</h2>}>
            <Head title={`Payslip ${slip.id}`} />
            
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    
                    {/* Toolbar */}
                    <div className="mb-6 flex justify-between items-center no-print">
                        <Link href={route('humanresurces3.index')} className="text-gray-600 hover:text-gray-900">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Back to Payroll
                        </Link>
                        <div className="flex gap-2">
                            <button onClick={handleEmail} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">
                                <FontAwesomeIcon icon={faEnvelope} className="mr-2" /> Email
                            </button>
                            <a href={route('humanresurces4.print', slip.id)} target="_blank" className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-900">
                                <FontAwesomeIcon icon={faPrint} className="mr-2" /> Print PDF
                            </a>
                        </div>
                    </div>

                    {/* Payslip Card */}
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                        {/* Header */}
                        <div className="bg-gray-800 text-white p-6 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold uppercase tracking-wider">Payslip</h1>
                                <p className="opacity-75">{slip.payroll_period?.name}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="font-bold text-lg">GreyCare Hospital</h2>
                                <p className="text-sm opacity-75">123 Medical Road, Nairobi</p>
                            </div>
                        </div>

                        {/* Employee Info */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500">Employee Name</span>
                                    <span className="font-semibold text-gray-800">{slip.employee.first_name} {slip.employee.last_name}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500">Employee ID</span>
                                    <span className="font-semibold text-gray-800">{slip.employee.employee_code}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500">Department</span>
                                    <span className="font-semibold text-gray-800">{slip.department_snapshot}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500">Position</span>
                                    <span className="font-semibold text-gray-800">{slip.job_title_snapshot}</span>
                                </div>
                            </div>
                        </div>

                        {/* Calculations */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Earnings Column */}
                                <div>
                                    <h3 className="text-md font-bold text-gray-700 border-b pb-2 mb-3 uppercase">Earnings</h3>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {earnings.map(item => (
                                                <tr key={item.id} className="border-b border-gray-50">
                                                    <td className="py-2 text-gray-600">{item.name}</td>
                                                    <td className="py-2 text-right font-medium">{parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                </tr>
                                            ))}
                                            {/* Padding rows if needed */}
                                            {earnings.length === 0 && <tr><td colSpan="2" className="py-2 text-gray-400 italic">No additional earnings</td></tr>}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td className="py-3 font-bold text-gray-800 pt-4">Gross Salary</td>
                                                <td className="py-3 text-right font-bold text-gray-800 pt-4">
                                                    {parseFloat(slip.gross_salary).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Deductions Column */}
                                <div>
                                    <h3 className="text-md font-bold text-gray-700 border-b pb-2 mb-3 uppercase">Deductions</h3>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {/* Taxes */}
                                            {taxes.map(item => (
                                                <tr key={item.id} className="border-b border-gray-50">
                                                    <td className="py-2 text-gray-600">{item.name}</td>
                                                    <td className="py-2 text-right font-medium">{parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                </tr>
                                            ))}
                                            {/* Other Deductions */}
                                            {deductions.map(item => (
                                                <tr key={item.id} className="border-b border-gray-50">
                                                    <td className="py-2 text-gray-600">{item.name}</td>
                                                    <td className="py-2 text-right font-medium">{parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td className="py-3 font-bold text-red-700 pt-4">Total Deductions</td>
                                                <td className="py-3 text-right font-bold text-red-700 pt-4">
                                                    {parseFloat(slip.total_deductions).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Net Pay Footer */}
                        <div className="bg-gray-100 p-6 flex justify-end items-center border-t border-gray-200">
                            <div className="text-right">
                                <span className="block text-sm text-gray-500 uppercase font-bold tracking-wider">Net Pay</span>
                                <span className="block text-3xl font-bold text-blue-700">
                                    {parseFloat(slip.net_pay).toLocaleString(undefined, {style: 'currency', currency: 'KES'})}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-400 mt-6 no-print">
                        System Generated Document | GreyCare HRM
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}