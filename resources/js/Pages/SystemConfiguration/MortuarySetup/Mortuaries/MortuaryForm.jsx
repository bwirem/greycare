import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faBuilding } from '@fortawesome/free-solid-svg-icons';

export default function MortuaryForm({ mortuary = null }) {
    
    const { data, setData, post, put, processing, errors } = useForm({
        name: mortuary?.name || '',
        type: mortuary?.type || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (mortuary) {
            put(route('systemconfiguration16.mortuaries.update', mortuary.id));
        } else {
            post(route('systemconfiguration16.mortuaries.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase border-b pb-2 mb-4">
                    <FontAwesomeIcon icon={faBuilding} className="mr-2 text-slate-400"/>
                    Facility Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Mortuary Name *
                        </label>
                        <input 
                            type="text" 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                            required 
                            placeholder="e.g. Main Hospital Mortuary"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Type / Designation
                        </label>
                        <input 
                            type="text" 
                            value={data.type} 
                            onChange={e => setData('type', e.target.value)} 
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                            placeholder="e.g. Main Building, Annex, VIP"
                        />
                        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration16.mortuaries.index')} className="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded">
                    Cancel
                </Link>
                <button disabled={processing} className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {mortuary ? 'Update Mortuary' : 'Save Mortuary'}
                </button>
            </div>
        </form>
    );
}