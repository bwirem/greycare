import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function ComponentForm({ component = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: component?.name || '',
        code: component?.code || '',
        shelf_life_days: component?.shelf_life_days || 35,
    });

    const submit = (e) => {
        e.preventDefault();
        if (component) {
            put(route('systemconfiguration10.components.update', component.id));
        } else {
            post(route('systemconfiguration10.components.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Component Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2" placeholder="e.g. Whole Blood" required />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Code *</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border rounded p-2" placeholder="e.g. WB" required />
                    {errors.code && <p className="text-red-500 text-xs">{errors.code}</p>}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Shelf Life (Days) *</label>
                <input type="number" value={data.shelf_life_days} onChange={e => setData('shelf_life_days', e.target.value)} className="w-full border rounded p-2" required />
                <p className="text-xs text-gray-500 mt-1">Used to calculate expiry date automatically.</p>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration10.components.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {component ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}