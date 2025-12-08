import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faBed } from '@fortawesome/free-solid-svg-icons';

export default function WardForm({ ward = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: ward?.name || '',
    });

    const submit = (e) => {
        e.preventDefault();
        ward ? put(route('systemconfiguration5.wards.update', ward.id)) 
             : post(route('systemconfiguration5.wards.store'));
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    <FontAwesomeIcon icon={faBed} className="mr-2 text-gray-400"/>
                    Ward Name *
                </label>
                <input 
                    type="text" 
                    value={data.name} 
                    onChange={e => setData('name', e.target.value)} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" 
                    required 
                    placeholder="e.g. Maternity Ward, General Male"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration5.wards.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded">Cancel</Link>
                <button disabled={processing} className="bg-orange-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-orange-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {ward ? 'Update Ward' : 'Save Ward'}
                </button>
            </div>
        </form>
    );
}