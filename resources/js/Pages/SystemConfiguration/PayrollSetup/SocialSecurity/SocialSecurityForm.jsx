import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function SocialSecurityForm({ social = null }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: social?.code || '',
        name: social?.name || '',
        employee_rate: social?.employee_rate || '0',
        employer_rate: social?.employer_rate || '0',
        max_deductible_amount: social?.max_deductible_amount || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (social) put(route('systemconfiguration12.social.update', social.id));
        else post(route('systemconfiguration12.social.store'), { onSuccess: () => reset() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Code*</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name*</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Employee Deduction (%)</label>
                    <input type="number" step="0.01" value={data.employee_rate} onChange={e => setData('employee_rate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Employer Contribution (%)</label>
                    <input type="number" step="0.01" value={data.employer_rate} onChange={e => setData('employer_rate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Maximum Salary Cap (Optional)</label>
                    <input type="number" step="0.01" value={data.max_deductible_amount} onChange={e => setData('max_deductible_amount', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g. 18000" />
                    <p className="text-xs text-gray-500">The contribution is calculated on salary up to this amount.</p>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t">
                <Link href={route('systemconfiguration12.social.index')} className="text-gray-700 font-medium py-2">Cancel</Link>
                <button type="submit" disabled={processing} className="px-6 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2 hover:bg-indigo-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {social ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}