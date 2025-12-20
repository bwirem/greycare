import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Edit({ auth, loan }) {
    const { data, setData, put, processing, errors } = useForm({
        loan_reference: loan.loan_reference || '',
        monthly_installment: loan.monthly_installment,
        current_balance: loan.current_balance,
        end_date: loan.end_date ? loan.end_date.split('T')[0] : '',
        is_active: loan.is_active === 1 || loan.is_active === true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('humanresurces2.update', loan.id));
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Edit Loan</h2>}>
            <Head title="Edit Loan" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-6 flex items-center justify-between border-b pb-4">
                            <div>
                                <h3 className="text-lg font-medium">Manage Loan: {loan.employee?.first_name} {loan.employee?.last_name}</h3>
                                <p className="text-sm text-gray-500">Principal: {loan.principal_amount}</p>
                            </div>
                            <Link href={route('humanresurces2.index')} className="text-sm text-gray-500 hover:text-gray-700">
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Back
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reference</label>
                                    <input 
                                        type="text" 
                                        value={data.loan_reference} 
                                        onChange={e => setData('loan_reference', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Outstanding Balance</label>
                                    <input 
                                        type="number" 
                                        value={data.current_balance} 
                                        onChange={e => setData('current_balance', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    />
                                    {errors.current_balance && <p className="text-red-500 text-xs mt-1">{errors.current_balance}</p>}
                                    <p className="text-xs text-orange-600 mt-1">Caution: Changing this manually overrides payroll deductions.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Monthly Deduction</label>
                                    <input 
                                        type="number" 
                                        value={data.monthly_installment} 
                                        onChange={e => setData('monthly_installment', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Expected End Date</label>
                                    <input 
                                        type="date" 
                                        value={data.end_date} 
                                        onChange={e => setData('end_date', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center text-sm font-medium text-gray-700">
                                        <input 
                                            type="checkbox" 
                                            checked={data.is_active} 
                                            onChange={e => setData('is_active', e.target.checked)} 
                                            className="rounded border-gray-300 text-orange-600 shadow-sm mr-2" 
                                        />
                                        Loan is Active (Deducting)
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={processing} className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                                    <FontAwesomeIcon icon={faSave} className="mr-2" /> Update Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}