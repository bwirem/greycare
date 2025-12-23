import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function StatusForm({ status = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: status?.name || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (status) {
            put(route('systemconfiguration5.dischargestatuses.update', status.id));
        } else {
            post(route('systemconfiguration5.dischargestatuses.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status Name *</label>
                    <input 
                        type="text" 
                        value={data.name} 
                        onChange={e => setData('name', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500" 
                        required 
                        placeholder="e.g. Recovered, Referred, Deceased"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration5.dischargestatuses.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-50 rounded transition">Cancel</Link>
                <button disabled={processing} className="bg-emerald-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-emerald-700 shadow-sm disabled:opacity-50">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {status ? 'Update Status' : 'Save Status'}
                </button>
            </div>
        </form>
    );
}