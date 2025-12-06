import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function GroupForm({ group = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: group?.name || '',
        code: group?.code || '',
        is_major: group ? Boolean(group.is_major) : false,
        is_minor: group ? Boolean(group.is_minor) : false,
    });

    const submit = (e) => {
        e.preventDefault();
        if (group) {
            put(route('systemconfiguration8.groups.update', group.id));
        } else {
            post(route('systemconfiguration8.groups.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Group Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2" required />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Code</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border rounded p-2" />
                </div>
            </div>

            <div className="flex gap-6">
                <label className="flex items-center">
                    <input type="checkbox" checked={data.is_major} onChange={e => setData('is_major', e.target.checked)} className="mr-2" />
                    Major Procedures
                </label>
                <label className="flex items-center">
                    <input type="checkbox" checked={data.is_minor} onChange={e => setData('is_minor', e.target.checked)} className="mr-2" />
                    Minor Procedures
                </label>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration8.groups.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {group ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}