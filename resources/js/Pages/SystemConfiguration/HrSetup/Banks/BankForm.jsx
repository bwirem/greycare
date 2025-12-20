import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function BankForm({ bank = null }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: bank?.code || '',
        name: bank?.name || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (bank) {
            put(route('systemconfiguration11.banks.update', bank.id));
        } else {
            post(route('systemconfiguration11.banks.store'), { onSuccess: () => reset() });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Code*</label>
                    <input 
                        type="text" 
                        value={data.code} 
                        onChange={e => setData('code', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" 
                        placeholder="e.g. KCB"
                    />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Name*</label>
                    <input 
                        type="text" 
                        value={data.name} 
                        onChange={e => setData('name', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" 
                        placeholder="e.g. Kenya Commercial Bank"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <Link href={route('systemconfiguration11.banks.index')} className="text-gray-700 font-medium py-2">Cancel</Link>
                <button type="submit" disabled={processing} className="px-6 py-2 bg-purple-600 text-white rounded-md flex items-center gap-2 hover:bg-purple-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {bank ? 'Update Bank' : 'Save Bank'}
                </button>
            </div>
        </form>
    );
}