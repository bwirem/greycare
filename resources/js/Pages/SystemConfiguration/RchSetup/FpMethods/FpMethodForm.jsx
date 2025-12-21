import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function FpMethodForm({ method = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: method?.name || '',
        code: method?.code || '',
        type: method?.type || '',
        is_active: method ? method.is_active : true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (method) {
            put(route('systemconfiguration14.fpmethods.update', method.id));
        } else {
            post(route('systemconfiguration14.fpmethods.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Method Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required placeholder="e.g. Microgynon" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Short Code *</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required placeholder="e.g. COC" />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                    <select value={data.type} onChange={e => setData('type', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                        <option value="">Select Type</option>
                        <option value="Hormonal">Hormonal (Pills, Injections)</option>
                        <option value="Barrier">Barrier (Condoms)</option>
                        <option value="Long-Acting">Long-Acting (Implant, IUCD)</option>
                        <option value="Permanent">Permanent (TL, Vasectomy)</option>
                        <option value="Natural">Natural</option>
                    </select>
                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                </div>
                {method && (
                    <div className="flex items-center mt-6">
                        <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <label className="ml-2 block text-sm text-gray-900">Is Active?</label>
                    </div>
                )}
            </div>
            
            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration14.fpmethods.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {method ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}