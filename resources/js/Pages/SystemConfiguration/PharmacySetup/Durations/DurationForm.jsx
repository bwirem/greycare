import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function DurationForm({ duration = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: duration?.name || '',
        code: duration?.code || '',
        days: duration?.days || 1,
        is_active: duration ? Boolean(duration.is_active) : true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (duration) {
            put(route('systemconfiguration9.durations.update', duration.id));
        } else {
            post(route('systemconfiguration9.durations.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 1 Week" required />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Short Code *</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 1/52" required />
                    {errors.code && <p className="text-red-500 text-xs">{errors.code}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Calculated Value (Days) *</label>
                <input type="number" value={data.days} onChange={e => setData('days', e.target.value)} className="w-full border rounded p-2" required />
                <p className="text-xs text-gray-500 mt-1">Example: For '1 Week', enter 7. Used for stock calculation.</p>
                {errors.days && <p className="text-red-500 text-xs">{errors.days}</p>}
            </div>

            <div className="flex items-center">
                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="mr-2" />
                <label>Active</label>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration9.durations.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {duration ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}