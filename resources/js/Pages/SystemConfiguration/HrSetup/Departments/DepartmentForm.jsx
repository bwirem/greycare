import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function DepartmentForm({ department = null }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: department?.code || '',
        name: department?.name || '',
        description: department?.description || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (department) {
            put(route('systemconfiguration11.departments.update', department.id));
        } else {
            post(route('systemconfiguration11.departments.store'), { onSuccess: () => reset() });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Code*</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name*</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="3" />
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t">
                <Link href={route('systemconfiguration11.departments.index')} className="text-gray-700 font-medium py-2">Cancel</Link>
                <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {department ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}