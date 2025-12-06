import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function PanelForm({ panel = null, categories, samples }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: panel?.name || '',
        code: panel?.code || '',
        lab_category_id: panel?.lab_category_id || '',
        lab_nature_of_sample_id: panel?.lab_nature_of_sample_id || '',
        is_available: panel ? Boolean(panel.is_available) : true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (panel) {
            put(route('systemconfiguration6.panels.update', panel.id));
        } else {
            post(route('systemconfiguration6.panels.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Test Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Short Code</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Department / Category *</label>
                    <select value={data.lab_category_id} onChange={e => setData('lab_category_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.lab_category_id && <p className="text-red-500 text-xs mt-1">{errors.lab_category_id}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Default Sample Type</label>
                    <select value={data.lab_nature_of_sample_id} onChange={e => setData('lab_nature_of_sample_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">Select Sample</option>
                        {samples.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center">
                <input type="checkbox" id="is_available" checked={data.is_available} onChange={e => setData('is_available', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">Available for Ordering</label>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration6.panels.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {panel ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}