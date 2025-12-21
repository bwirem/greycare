import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function VaccineForm({ vaccine = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: vaccine?.name || '',
        code: vaccine?.code || '',
        target_age_weeks: vaccine?.target_age_weeks || '',
        is_active: vaccine ? vaccine.is_active : true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (vaccine) {
            put(route('systemconfiguration14.vaccines.update', vaccine.id));
        } else {
            post(route('systemconfiguration14.vaccines.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Vaccine Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required placeholder="e.g. Polio 0" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Short Code *</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required placeholder="e.g. OPV0" />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Target Age (Weeks)</label>
                    <input type="number" value={data.target_age_weeks} onChange={e => setData('target_age_weeks', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="0 for Birth" />
                    <p className="text-xs text-gray-500 mt-1">Enter 0 for 'At Birth'. 6 for '6 Weeks', etc.</p>
                </div>
                {vaccine && (
                    <div className="flex items-center mt-6">
                        <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <label className="ml-2 block text-sm text-gray-900">Is Active?</label>
                    </div>
                )}
            </div>
            
            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration14.vaccines.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {vaccine ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}