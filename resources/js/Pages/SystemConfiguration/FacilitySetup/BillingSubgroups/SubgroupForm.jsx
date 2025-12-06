import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function SubgroupForm({ subgroup = null, billingGroups }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: subgroup?.name || '',
        code: subgroup?.code || '',
        billinggroup_id: subgroup?.billinggroup_id || '',
        description: subgroup?.description || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (subgroup) {
            put(route('systemconfiguration5.billingsubgroups.update', subgroup.id));
        } else {
            post(route('systemconfiguration5.billingsubgroups.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Scheme Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2" required />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Group *</label>
                    <select value={data.billinggroup_id} onChange={e => setData('billinggroup_id', e.target.value)} className="w-full border rounded p-2" required>
                        <option value="">Select Group</option>
                        {billingGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    {errors.billinggroup_id && <p className="text-red-500 text-xs">{errors.billinggroup_id}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Short Code</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className="w-full border rounded p-2" />
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration5.billingsubgroups.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {subgroup ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}