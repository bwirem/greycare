import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function RouteForm({ routeItem = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: routeItem?.name || '',
        abbreviation: routeItem?.abbreviation || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (routeItem) {
            put(route('systemconfiguration9.routes.update', routeItem.id));
        } else {
            post(route('systemconfiguration9.routes.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Route Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2" placeholder="e.g. Oral" required />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Abbreviation</label>
                    <input type="text" value={data.abbreviation} onChange={e => setData('abbreviation', e.target.value)} className="w-full border rounded p-2" placeholder="e.g. PO" />
                    {errors.abbreviation && <p className="text-red-500 text-xs">{errors.abbreviation}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration9.routes.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {routeItem ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}