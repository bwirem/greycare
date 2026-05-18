import React from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faLock, faUnlock, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function ProcedureForm({ procedure = null, groups, activePriceCategories = [] }) {
    
    // 1. Get Auth
    const { auth } = usePage().props;
    const canEditPrice = true; // Placeholder for permissions

    // 2. Initialize Prices
    const initialPrices = procedure?.bls_item || {};

    const { data, setData, post, put, processing, errors } = useForm({
        name: procedure?.name || '',
        code: procedure?.code || '',
        theatre_procedure_group_id: procedure?.theatre_procedure_group_id || '',
        
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
        if (procedure) {
            put(route('systemconfiguration8.procedures.update', procedure.id));
        } else {
            post(route('systemconfiguration8.procedures.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: Procedure Details */}
                <div className="p-4 border rounded-md space-y-4 bg-white">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Procedure Details</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Procedure Name *</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required placeholder="e.g., Appendectomy" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Code (CPT)</label>
                            <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Group</label>
                            <select value={data.theatre_procedure_group_id} onChange={e => setData('theatre_procedure_group_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="">Select Group</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
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
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration8.procedures.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {procedure ? 'Update Procedure' : 'Save Procedure'}
                </button>
            </div>
        </form>
    );
}