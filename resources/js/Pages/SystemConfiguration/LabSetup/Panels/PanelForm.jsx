import React from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faLock, faUnlock, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function PanelForm({ panel = null, categories, samples,products, activePriceCategories = [] }) {
    
    // 1. Get Auth/Permissions (Assuming generic permission check or allow all for now)
    // You can adjust 'systemconfiguration6.allow_price' based on your actual permission keys
    const { auth } = usePage().props;
    const canEditPrice = true; // Set to logic based on auth.user if needed, e.g., auth.user.permissions.includes(...)

    // 2. Initialize Prices from the linked BLSItem (if editing)
    const initialPrices = panel?.bls_item || {};

    const { data, setData, post, put, processing, errors } = useForm({
        name: panel?.name || '',
        code: panel?.code || '',
        lab_category_id: panel?.lab_category_id || '',
        lab_nature_of_sample_id: panel?.lab_nature_of_sample_id || '',
        iv_product_id: panel?.iv_product_id || '',
        is_available: panel ? Boolean(panel.is_available) : true,

        // Initialize dynamic selling prices
        price1: initialPrices.price1 || '0.00',
        price2: initialPrices.price2 || '0.00',
        price3: initialPrices.price3 || '0.00',
        price4: initialPrices.price4 || '0.00',
        price5: initialPrices.price5 || '0.00',
        price6: initialPrices.price6 || '0.00',
        price7: initialPrices.price7 || '0.00',
        price8: initialPrices.price8 || '0.00', 
        price9: initialPrices.price9 || '0.00',
        price10: initialPrices.price10 || '0.00',
        price11: initialPrices.price11 || '0.00',
        price12: initialPrices.price12 || '0.00',
        price13: initialPrices.price13 || '0.00',
        price14: initialPrices.price14 || '0.00',
        price15: initialPrices.price15 || '0.00',
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: Clinical Details */}
                <div className="p-4 border rounded-md space-y-4 bg-white">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Test Details</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Test Name *</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Short Code</label>
                            <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department *</label>
                            <select value={data.lab_category_id} onChange={e => setData('lab_category_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {errors.lab_category_id && <p className="text-red-500 text-xs mt-1">{errors.lab_category_id}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Default Sample Type</label>
                        <select value={data.lab_nature_of_sample_id} onChange={e => setData('lab_nature_of_sample_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <option value="">Select Sample</option>
                            {samples.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mapped Stock</label>
                        <select value={data.iv_product_id} onChange={e => setData('iv_product_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <option value="">Select Product</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center pt-2">
                        <input type="checkbox" id="is_available" checked={data.is_available} onChange={e => setData('is_available', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">Available for Ordering</label>
                    </div>
                </div>

                {/* Right Column: Pricing */}
                <div className={`p-4 border rounded-md space-y-4 ${canEditPrice ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Selling Prices</h3>
                        {canEditPrice ? 
                            <span className="text-xs text-green-600 flex items-center gap-1"><FontAwesomeIcon icon={faUnlock} /> Editable</span> : 
                            <span className="text-xs text-gray-500 flex items-center gap-1"><FontAwesomeIcon icon={faLock} /> Read-Only</span>
                        }
                    </div>

                    <div className="space-y-4">
                        {activePriceCategories.map(category => (
                            <div key={category.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                                <label htmlFor={category.key} className="text-gray-700 font-medium w-32">{category.label}:</label>
                                
                                {canEditPrice ? (
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        id={category.key}
                                        value={data[category.key]} 
                                        onChange={e => setData(category.key, e.target.value)}
                                        className="block w-full sm:w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-right"
                                    />
                                ) : (
                                    <span className="font-semibold text-gray-800 bg-gray-100 px-3 py-2 rounded-md w-full sm:w-40 text-right border border-gray-200">
                                        {parseFloat(data[category.key] || 0).toFixed(2)}
                                    </span>
                                )}
                            </div>
                        ))}
                         {activePriceCategories.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No price categories configured in settings.</p>
                        )}
                    </div>

                    {!canEditPrice && (
                        <div className="mt-2 text-xs text-gray-500 flex items-start gap-2">
                            <FontAwesomeIcon icon={faInfoCircle} className="mt-0.5" />
                            <span>You do not have permission to edit prices.</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration6.panels.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {panel ? 'Update Panel' : 'Save Panel'}
                </button>
            </div>
        </form>
    );
}