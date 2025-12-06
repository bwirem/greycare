import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function DeferralForm({ deferral = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: deferral?.name || '',
        type: deferral?.type || 'Temporary',
        deferral_days: deferral?.deferral_days || 0,
    });

    const submit = (e) => {
        e.preventDefault();
        if (deferral) {
            put(route('systemconfiguration10.deferrals.update', deferral.id));
        } else {
            post(route('systemconfiguration10.deferrals.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Reason *</label>
                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2" placeholder="e.g. Low Hemoglobin" required />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full border rounded p-2">
                        <option value="Temporary">Temporary</option>
                        <option value="Permanent">Permanent</option>
                    </select>
                </div>
                {data.type === 'Temporary' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deferral Days</label>
                        <input type="number" value={data.deferral_days} onChange={e => setData('deferral_days', e.target.value)} className="w-full border rounded p-2" />
                        <p className="text-xs text-gray-500 mt-1">Days before donor can donate again.</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration10.deferrals.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {deferral ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}