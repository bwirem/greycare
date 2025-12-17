import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faLink, faKey, faUserSecret } from '@fortawesome/free-solid-svg-icons';

export default function GroupForm({ group = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: group?.name || '',
        code: group?.code || '',
        pricecategory: group?.pricecategory || '',
        
        // Configuration Flags
        hasid: group ? Boolean(group.hasid) : false,
        hasceiling: group ? Boolean(group.hasceiling) : false,
        ceilingamount: group?.ceilingamount || 0,
        isinsurance: group ? Boolean(group.isinsurance) : false,
        isdefault: group ? Boolean(group.isdefault) : false,
        isexemption: group ? Boolean(group.isexemption) : false,
        inactive: group ? Boolean(group.inactive) : false,

        // API Credentials (New)
        facility_code: group?.facility_code || '',
        verification_url: group?.verification_url || '',
        claims_url: group?.claims_url || '',
        username: group?.username || '',
        password: group?.password || '',
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
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Basic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Group Name *</label>
                        <input 
                            type="text" 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                            required 
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Short Code</label>
                        <input 
                            type="text" 
                            value={data.code} 
                            onChange={e => setData('code', e.target.value)} 
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price Category Link</label>
                        <input 
                            type="text" 
                            value={data.pricecategory} 
                            onChange={e => setData('pricecategory', e.target.value)} 
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="e.g. price1" 
                        />
                        <p className="text-xs text-gray-500 mt-1">Maps to pricing column in items table (price1, price2, etc).</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ceiling Amount</label>
                        <input 
                            type="number" 
                            value={data.ceilingamount} 
                            onChange={e => setData('ceilingamount', e.target.value)} 
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
                            disabled={!data.hasceiling} 
                        />
                    </div>
                </div>
            </div>

            {/* Config Flags */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wide">Settings & Behavior</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={data.isinsurance} onChange={e => setData('isinsurance', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-medium">Is Insurance Company</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={data.hasid} onChange={e => setData('hasid', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm">Require Member ID</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={data.hasceiling} onChange={e => setData('hasceiling', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm">Has Spending Limit</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={data.isexemption} onChange={e => setData('isexemption', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm">Is Exemption Category</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={data.isdefault} onChange={e => setData('isdefault', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm">Is Default Group</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={data.inactive} onChange={e => setData('inactive', e.target.checked)} className="rounded text-red-600 focus:ring-red-500" />
                        <span className="text-sm text-red-600 font-bold">Deactivate Group</span>
                    </label>
                </div>
            </div>

            {/* API Credentials (Only if Insurance) */}
            {data.isinsurance && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 animate-fade-in">
                    <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faLink} /> External API Configuration
                    </h3>
                    <div className="grid grid-cols-1 gap-6">                       
                        <div>
                            <label className="block text-sm font-medium text-blue-900">Facility Code (NHIF)</label>
                            <input 
                                type="text" 
                                value={data.facility_code} 
                                onChange={e => setData('facility_code', e.target.value)} 
                                className="w-full border-blue-300 rounded-md shadow-sm" 
                            />
                        </div>                        
                        <div>
                            <label className="block text-sm font-medium text-blue-900">API Base URL</label>
                            <input 
                                type="text" 
                                value={data.verification_url} 
                                onChange={e => setData('verification_url', e.target.value)} 
                                className="w-full border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                                placeholder="http://196.13.105.15/nhifservice/"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-900">Claims/Package URL</label>
                            <input 
                                type="text" 
                                value={data.claims_url} 
                                onChange={e => setData('claims_url', e.target.value)} 
                                className="w-full border-blue-300 rounded-md shadow-sm" 
                                placeholder="http://test.nhif.or.tz/claimsserver/"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-blue-900">
                                    <FontAwesomeIcon icon={faUserSecret} className="mr-1" /> API Username
                                </label>
                                <input 
                                    type="text" 
                                    value={data.username} 
                                    onChange={e => setData('username', e.target.value)} 
                                    className="w-full border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900">
                                    <FontAwesomeIcon icon={faKey} className="mr-1" /> API Password
                                </label>
                                <input 
                                    type="password" 
                                    value={data.password} 
                                    onChange={e => setData('password', e.target.value)} 
                                    className="w-full border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration5.billinggroups.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-50 rounded transition">Cancel</Link>
                <button 
                    disabled={processing} 
                    className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
                >
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {group ? 'Update Group' : 'Create Group'}
                </button>
            </div>
        </form>
    );
}