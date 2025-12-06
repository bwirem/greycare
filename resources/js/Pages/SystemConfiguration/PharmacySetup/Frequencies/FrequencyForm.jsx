import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function FrequencyForm({ frequency = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: frequency?.name || '',
        code: frequency?.code || '',
        value: frequency?.value || 1,
    });

    const submit = (e) => {
        e.preventDefault();
        if (frequency) {
            put(route('systemconfiguration9.frequencies.update', frequency.id));
        } else {
            post(route('systemconfiguration9.frequencies.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Frequency Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2" placeholder="e.g. Twice Daily" required />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Short Code *</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border rounded p-2" placeholder="e.g. BID" required />
                    {errors.code && <p className="text-red-500 text-xs">{errors.code}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Multiplier Value *</label>
                <input type="number" step="0.01" value={data.value} onChange={e => setData('value', e.target.value)} className="w-full border rounded p-2" required />
                <p className="text-xs text-gray-500 mt-1">Example: For BID (Twice a Day), enter 2. This multiplies the dosage.</p>
                {errors.value && <p className="text-red-500 text-xs">{errors.value}</p>}
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration9.frequencies.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {frequency ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}