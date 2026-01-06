import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faBed, faMoneyBillWave, faVenusMars, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

export default function WardForm({ ward = null, activePriceCategories = [] }) {
    
    // Initialize prices from linked Billing Item
    const initialPrices = ward?.bls_item || {};

    const { data, setData, post, put, processing, errors } = useForm({
        name: ward?.name || '',
        type: ward?.type || '',
        gender: ward?.gender || 'Mixed',
        
        // Dynamic Prices
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
    });

    const submit = (e) => {
        e.preventDefault();
        if (ward) {
            put(route('systemconfiguration5.wards.update', ward.id));
        } else {
            post(route('systemconfiguration5.wards.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: Ward Details */}
                <div className="p-4 bg-white border rounded-lg shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-700 uppercase border-b pb-2 mb-4">Ward Configuration</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <FontAwesomeIcon icon={faBed} className="mr-2 text-gray-400"/>
                            Ward Name *
                        </label>
                        <input 
                            type="text" 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" 
                            required 
                            placeholder="e.g. Maternity Ward, General Male"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-gray-400"/>
                                Ward Type
                            </label>
                            <select 
                                value={data.type} 
                                onChange={e => setData('type', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            >
                                <option value="">Select Type</option>
                                <option value="General">General</option>
                                <option value="Private">Private</option>
                                <option value="ICU">ICU</option>
                                <option value="Maternity">Maternity</option>
                                <option value="Pediatric">Pediatric</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                <FontAwesomeIcon icon={faVenusMars} className="mr-2 text-gray-400"/>
                                Gender
                            </label>
                            <select 
                                value={data.gender} 
                                onChange={e => setData('gender', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            >
                                <option value="Mixed">Mixed</option>
                                <option value="Male">Male Only</option>
                                <option value="Female">Female Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing */}
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-orange-800 uppercase border-b border-orange-200 pb-2 mb-4 flex items-center">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" /> Daily Bed Charges
                    </h3>
                    
                    <div className="space-y-3">
                        {activePriceCategories.map(category => (
                            <div key={category.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                                <label htmlFor={category.key} className="text-gray-700 font-medium w-32">{category.label}:</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    id={category.key}
                                    value={data[category.key]} 
                                    onChange={e => setData(category.key, e.target.value)}
                                    className="block w-full sm:w-40 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-right"
                                />
                            </div>
                        ))}
                        {activePriceCategories.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No price categories configured.</p>
                        )}
                    </div>
                    <p className="text-xs text-orange-700 mt-2 italic">
                        This amount is automatically added to the patient's bill every night during their stay.
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration5.wards.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded">Cancel</Link>
                <button disabled={processing} className="bg-orange-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-orange-700 disabled:opacity-50">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {ward ? 'Update Ward' : 'Save Ward'}
                </button>
            </div>
        </form>
    );
}