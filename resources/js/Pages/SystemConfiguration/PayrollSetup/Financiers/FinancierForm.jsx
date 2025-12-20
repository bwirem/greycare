import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function FinancierForm({ financier = null }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: financier?.code || '',
        name: financier?.name || '',
        contact_info: financier?.contact_info || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (financier) put(route('systemconfiguration12.financiers.update', financier.id));
        else post(route('systemconfiguration12.financiers.store'), { onSuccess: () => reset() });
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
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Contact Info</label>
                    <textarea value={data.contact_info} onChange={e => setData('contact_info', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="2" placeholder="Address, Phone, Email..." />
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t">
                <Link href={route('systemconfiguration12.financiers.index')} className="text-gray-700 font-medium py-2">Cancel</Link>
                <button type="submit" disabled={processing} className="px-6 py-2 bg-orange-600 text-white rounded-md flex items-center gap-2 hover:bg-orange-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {financier ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}