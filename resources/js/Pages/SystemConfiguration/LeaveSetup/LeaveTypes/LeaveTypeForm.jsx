import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function LeaveTypeForm({ type = null }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: type?.name || '',
        days_per_year: type?.days_per_year || '21',
        description: type?.description || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (type) {
            put(route('systemconfiguration13.leavetypes.update', type.id));
        } else {
            post(route('systemconfiguration13.leavetypes.store'), { onSuccess: () => reset() });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Leave Name*</label>
                    <input 
                        type="text" 
                        value={data.name} 
                        onChange={e => setData('name', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                        placeholder="e.g. Annual Leave"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Default Days per Year*</label>
                    <input 
                        type="number" 
                        value={data.days_per_year} 
                        onChange={e => setData('days_per_year', e.target.value)} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                    />
                    {errors.days_per_year && <p className="text-red-500 text-xs mt-1">{errors.days_per_year}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description / Policy</label>
                <textarea 
                    value={data.description} 
                    onChange={e => setData('description', e.target.value)} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                    rows="3"
                    placeholder="Brief description of when this leave applies."
                />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <Link href={route('systemconfiguration13.leavetypes.index')} className="text-gray-700 font-medium py-2">Cancel</Link>
                <button type="submit" disabled={processing} className="px-6 py-2 bg-teal-600 text-white rounded-md flex items-center gap-2 hover:bg-teal-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {type ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}