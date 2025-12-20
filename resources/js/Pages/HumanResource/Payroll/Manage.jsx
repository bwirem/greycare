import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalculator, faCheckDouble, faMoneyBillWave, faFileInvoiceDollar, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import Pagination from "@/Components/Pagination";
import Modal from '@/Components/CustomModal';

export default function Manage({ auth, period, slips, stats, flash }) {
    const [confirmAction, setConfirmAction] = useState({ isOpen: false, type: null, title: '', message: '' });

    const triggerAction = (type, title, message) => {
        setConfirmAction({ isOpen: true, type, title, message });
    };

    const handleConfirm = () => {
        const routes = {
            'generate': route('humanresurces3.generate', period.id),
            'approve': route('humanresurces3.approve', period.id),
            'pay': route('humanresurces3.pay', period.id),
        };
        
        router.post(routes[confirmAction.type], {}, {
            onSuccess: () => setConfirmAction({ isOpen: false, type: null, title: '', message: '' })
        });
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Manage Payroll: {period.name}</h2>}>
            <Head title={`Payroll ${period.name}`} />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {flash?.success && <div className="p-4 bg-green-100 text-green-700 rounded-md shadow-sm">{flash.success}</div>}
                    {flash?.error && <div className="p-4 bg-red-100 text-red-700 rounded-md shadow-sm">{flash.error}</div>}

                    {/* Controls & Stats */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Period Status: <span className="text-blue-600">{period.status}</span></h3>
                                <p className="text-sm text-gray-500">{period.start_date} to {period.end_date}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {/* Action Buttons Logic */}
                                {period.status !== 'Paid' && (
                                    <button 
                                        onClick={() => triggerAction('generate', 'Generate Payroll', 'This will calculate salaries for all active employees. Existing drafts for this month will be overwritten.')}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 text-sm"
                                        disabled={period.status === 'Approved'}
                                    >
                                        <FontAwesomeIcon icon={faCalculator} className="mr-2" /> Calculate
                                    </button>
                                )}
                                
                                {period.status === 'Processing' && (
                                    <button 
                                        onClick={() => triggerAction('approve', 'Approve Payroll', 'This locks the payroll for payment. No further changes can be made.')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-sm"
                                    >
                                        <FontAwesomeIcon icon={faCheckDouble} className="mr-2" /> Approve
                                    </button>
                                )}
                                
                                {period.status === 'Approved' && (
                                    <button 
                                        onClick={() => triggerAction('pay', 'Process Payment', 'This will mark slips as paid and update loan balances. This action is irreversible.')}
                                        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 text-sm"
                                    >
                                        <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" /> Pay Now
                                    </button>
                                )}

                                <Link href={route('humanresurces3.index')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm">
                                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                                </Link>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                            <div className="bg-gray-50 p-4 rounded border">
                                <span className="text-gray-500 text-xs uppercase">Total Employees</span>
                                <div className="text-2xl font-bold">{stats.employee_count}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded border">
                                <span className="text-gray-500 text-xs uppercase">Total Gross Pay</span>
                                <div className="text-2xl font-bold text-gray-800">{stats.total_gross.toLocaleString()}</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded border border-blue-200">
                                <span className="text-blue-600 text-xs uppercase">Total Net Pay</span>
                                <div className="text-2xl font-bold text-blue-700">{stats.total_net.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Payslip List */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h4 className="text-md font-bold mb-4">Generated Payslips</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Employee</th>
                                        <th className="px-4 py-3 text-right">Basic</th>
                                        <th className="px-4 py-3 text-right">Allowances</th>
                                        <th className="px-4 py-3 text-right">Gross</th>
                                        <th className="px-4 py-3 text-right text-red-600">Deductions</th>
                                        <th className="px-4 py-3 text-right text-blue-700 font-bold">Net Pay</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {slips.data.map(slip => (
                                        <tr key={slip.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{slip.employee.first_name} {slip.employee.last_name}</div>
                                                <div className="text-xs text-gray-500">{slip.job_title_snapshot}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">{parseFloat(slip.basic_salary).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-sm">{parseFloat(slip.total_allowances).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold">{parseFloat(slip.gross_salary).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-sm text-red-600">-{parseFloat(slip.total_deductions).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-blue-700">{parseFloat(slip.net_pay).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Link href={route('humanresurces4.show', slip.id)} className="text-indigo-600 hover:text-indigo-900 text-sm">
                                                    <FontAwesomeIcon icon={faFileInvoiceDollar} /> View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {slips.data.length === 0 && (
                                        <tr><td colSpan="7" className="text-center py-8 text-gray-500">No payslips generated yet. Click 'Calculate' to begin.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination class="mt-6" links={slips.links} />
                    </div>
                </div>
            </div>
            
            <Modal 
                isOpen={confirmAction.isOpen} 
                onClose={() => setConfirmAction({...confirmAction, isOpen: false})} 
                onConfirm={handleConfirm}
                title={confirmAction.title}
                message={confirmAction.message}
            />
        </HumanResourceLayout>
    );
}