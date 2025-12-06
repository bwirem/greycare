import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function RejectionForm({ reason = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: reason?.name || '',
        code: reason?.code || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (reason) {
            put(route('systemconfiguration6.rejections.update', reason.id));
        } else {
            post(route('systemconfiguration6.rejections.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Reason Name *</label>
                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Short Code</label>
                <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration6.rejections.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {reason ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}