import React from 'react';
import { useForm } from '@inertiajs/react';

export default function BankingForm({ employee, banks }) {
    const banking = employee.banking?.[0];

    const { data, setData, post, put, processing, errors } = useForm({
        bank_id: banking?.bank_id || '',
        branch_name: banking?.branch_name || '',
        account_number: banking?.account_number || '',
        account_name: banking?.account_name || `${employee.first_name} ${employee.last_name}`,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (banking) {
            // FIX: Pass [employee.id, banking.id] array for nested route
            put(route('humanresurces0.banking.update', [employee.id, banking.id]));
        } else {
            post(route('humanresurces0.banking.store', employee.id));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bank*</label>
                    <select value={data.bank_id} onChange={e => setData('bank_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">Select Bank</option>
                        {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    {errors.bank_id && <p className="text-red-500 text-xs">{errors.bank_id}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <input type="text" value={data.branch_name} onChange={e => setData('branch_name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number*</label>
                    <input type="text" value={data.account_number} onChange={e => setData('account_number', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    {errors.account_number && <p className="text-red-500 text-xs">{errors.account_number}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Account Name*</label>
                    <input type="text" value={data.account_name} onChange={e => setData('account_name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={processing} className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    {banking ? 'Update Banking' : 'Save Banking'}
                </button>
            </div>
        </form>
    );
}