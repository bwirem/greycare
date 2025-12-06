import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function GroupForm({ group = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: group?.name || '',
        code: group?.code || '',
        pricecategory: group?.pricecategory || '',
        hasid: group ? Boolean(group.hasid) : false,
        hasceiling: group ? Boolean(group.hasceiling) : false,
        ceilingamount: group?.ceilingamount || 0,
        isinsurance: group ? Boolean(group.isinsurance) : false,
        isdefault: group ? Boolean(group.isdefault) : false,
        isexemption: group ? Boolean(group.isexemption) : false,
        inactive: group ? Boolean(group.inactive) : false,
    });

    const submit = (e) => {
        e.preventDefault();
        if (group) {
            put(route('systemconfiguration5.billinggroups.update', group.id));
        } else {
            post(route('systemconfiguration5.billinggroups.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Group Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded p-2" required />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Short Code</label>
                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border rounded p-2" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price Category Link</label>
                    <input type="text" value={data.pricecategory} onChange={e => setData('pricecategory', e.target.value)} className="w-full border rounded p-2" placeholder="e.g. price1" />
                    <p className="text-xs text-gray-500">Maps to pricing column in items table (price1, price2, etc).</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ceiling Amount</label>
                    <input type="number" value={data.ceilingamount} onChange={e => setData('ceilingamount', e.target.value)} className="w-full border rounded p-2" disabled={!data.hasceiling} />
                </div>
            </div>

            {/* Config Flags */}
            <div className="bg-gray-50 p-4 rounded border grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={data.isinsurance} onChange={e => setData('isinsurance', e.target.checked)} className="rounded text-blue-600" />
                    <span className="text-sm">Is Insurance Company</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={data.hasid} onChange={e => setData('hasid', e.target.checked)} className="rounded text-blue-600" />
                    <span className="text-sm">Require Member ID</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={data.hasceiling} onChange={e => setData('hasceiling', e.target.checked)} className="rounded text-blue-600" />
                    <span className="text-sm">Has Spending Limit</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={data.isexemption} onChange={e => setData('isexemption', e.target.checked)} className="rounded text-blue-600" />
                    <span className="text-sm">Is Exemption Category</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={data.isdefault} onChange={e => setData('isdefault', e.target.checked)} className="rounded text-blue-600" />
                    <span className="text-sm">Is Default Group</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={data.inactive} onChange={e => setData('inactive', e.target.checked)} className="rounded text-red-600" />
                    <span className="text-sm text-red-600 font-bold">Deactivate Group</span>
                </label>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration5.billinggroups.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {group ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}