import React, { useState, useEffect } from 'react';
import { Link, useForm ,Head} from '@inertiajs/react';
import HumanResourceLayout from '@/Layouts/HumanResourceLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faSpinner, faCalculator } from '@fortawesome/free-solid-svg-icons';

export default function Create({ auth, employees, financiers }) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        financier_id: '',
        loan_reference: '',
        principal_amount: '',
        interest_rate: '0',
        monthly_installment: '',
        start_date: new Date().toISOString().split('T')[0],
        duration_months: '12'
    });

    // Simple Calculator for Installment
    const calculateInstallment = () => {
        const principal = parseFloat(data.principal_amount) || 0;
        const months = parseInt(data.duration_months) || 1;
        const rate = parseFloat(data.interest_rate) || 0;
        
        // Simple Interest Formula: (P + (P*R*T/100)) / Months
        // Note: Logic depends on company policy (Reducing Balance vs Flat Rate)
        // Here assuming Flat Rate per Annum for simplicity
        const interestTotal = principal * (rate / 100) * (months / 12);
        const total = principal + interestTotal;
        const installment = total / months;

        setData('monthly_installment', installment.toFixed(2));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('humanresurces2.store'));
    };

    return (
        <HumanResourceLayout user={auth.user} header={<h2 className="text-xl font-semibold">Grant New Loan</h2>}>
            <Head title="New Loan" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-6 flex items-center justify-between border-b pb-4">
                            <h3 className="text-lg font-medium">Loan Application</h3>
                            <Link href={route('humanresurces2.index')} className="text-sm text-gray-500 hover:text-gray-700">
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Back
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Employee Selection */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Employee*</label>
                                    <select 
                                        value={data.employee_id} 
                                        onChange={e => setData('employee_id', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.first_name} {emp.last_name} ({emp.employee_code})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.employee_id && <p className="text-red-500 text-xs mt-1">{errors.employee_id}</p>}
                                </div>

                                {/* Financier */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lender (Financier)</label>
                                    <select 
                                        value={data.financier_id} 
                                        onChange={e => setData('financier_id', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    >
                                        <option value="">Company (Internal)</option>
                                        {financiers.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Leave blank for internal company advances.</p>
                                </div>

                                {/* Reference */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loan Reference / Ref No.</label>
                                    <input 
                                        type="text" 
                                        value={data.loan_reference} 
                                        onChange={e => setData('loan_reference', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                        placeholder="e.g. ADV-2025-001"
                                    />
                                    {errors.loan_reference && <p className="text-red-500 text-xs mt-1">{errors.loan_reference}</p>}
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Principal Amount*</label>
                                    <div className="relative mt-1 rounded-md shadow-sm">
                                        <input 
                                            type="number" 
                                            value={data.principal_amount} 
                                            onChange={e => setData('principal_amount', e.target.value)} 
                                            className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-orange-500 focus:ring-orange-500" 
                                            placeholder="0.00"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-gray-500 sm:text-sm">Currency</span>
                                        </div>
                                    </div>
                                    {errors.principal_amount && <p className="text-red-500 text-xs mt-1">{errors.principal_amount}</p>}
                                </div>

                                {/* Interest */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Interest Rate (% p.a)</label>
                                    <input 
                                        type="number" 
                                        value={data.interest_rate} 
                                        onChange={e => setData('interest_rate', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    />
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (Months)</label>
                                    <input 
                                        type="number" 
                                        value={data.duration_months} 
                                        onChange={e => setData('duration_months', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    />
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Deduction Start Date</label>
                                    <input 
                                        type="date" 
                                        value={data.start_date} 
                                        onChange={e => setData('start_date', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                                    />
                                </div>

                                {/* Installment */}
                                <div className="md:col-span-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <div className="flex justify-between items-end">
                                        <div className="w-full mr-4">
                                            <label className="block text-sm font-bold text-gray-700">Monthly Deduction</label>
                                            <input 
                                                type="number" 
                                                value={data.monthly_installment} 
                                                onChange={e => setData('monthly_installment', e.target.value)} 
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white" 
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={calculateInstallment}
                                            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 h-10 mb-0.5"
                                        >
                                            <FontAwesomeIcon icon={faCalculator} className="mr-1" /> Auto-Calc
                                        </button>
                                    </div>
                                    {errors.monthly_installment && <p className="text-red-500 text-xs mt-1">{errors.monthly_installment}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={processing} className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center">
                                    {processing ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faSave} className="mr-2" />}
                                    Grant Loan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </HumanResourceLayout>
    );
}