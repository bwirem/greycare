import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faDoorClosed, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import CabinetManager from './CabinetManager';

export default function RoomForm({ room = null, mortuaries = [], activePriceCategories = [] }) {
    
    // Initialize prices from linked Billing Item
    const initialPrices = room?.bls_item || {};

    const { data, setData, post, put, processing, errors } = useForm({
        name: room?.name || '',
        mortuary_id: room?.mortuary_id || '',
        
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
        price11: initialPrices.price11 || '0.00',
        price12: initialPrices.price12 || '0.00',
        price13: initialPrices.price13 || '0.00',
        price14: initialPrices.price14 || '0.00',
        price15: initialPrices.price15 || '0.00',
    });

    const submit = (e) => {
        e.preventDefault();
        if (room) {
            put(route('systemconfiguration16.rooms.update', room.id));
        } else {
            post(route('systemconfiguration16.rooms.store'));
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={submit} className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left Column: Room Details */}
                    <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 uppercase border-b pb-2 mb-4">
                            Room Configuration
                        </h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                <FontAwesomeIcon icon={faDoorClosed} className="mr-2 text-slate-400"/>
                                Room Name *
                            </label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                required 
                                placeholder="e.g. VIP Cold Room"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Assign to Mortuary Facility *</label>
                            <select 
                                value={data.mortuary_id} 
                                onChange={e => setData('mortuary_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">-- Select Facility --</option>
                                {mortuaries.map(mortuary => (
                                    <option key={mortuary.id} value={mortuary.id}>{mortuary.name}</option>
                                ))}
                            </select>
                            {errors.mortuary_id && <p className="text-red-500 text-xs mt-1">{errors.mortuary_id}</p>}
                        </div>
                    </div>

                    {/* Right Column: Pricing */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-200 pb-2 mb-4 flex items-center">
                            <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-indigo-500" /> Daily Storage Charges
                        </h3>
                        
                        <div className="space-y-3">
                            {activePriceCategories.map(category => (
                                <div key={category.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                                    <label htmlFor={category.key} className="text-slate-700 font-medium w-32">{category.label}:</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        id={category.key}
                                        value={data[category.key]} 
                                        onChange={e => setData(category.key, e.target.value)}
                                        className="block w-full sm:w-40 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-right"
                                    />
                                </div>
                            ))}
                            {activePriceCategories.length === 0 && (
                                <p className="text-sm text-slate-500 italic">No price categories configured.</p>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 italic">
                            This amount will be used to calculate storage bills per day.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t pt-4">
                    <Link href={route('systemconfiguration16.rooms.index')} className="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded">Cancel</Link>
                    <button disabled={processing} className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 shadow">
                        {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                        {room ? 'Update Room' : 'Save Room'}
                    </button>
                </div>
            </form>

            {/* Cabinet Manager (Only show if editing an existing room) */}
            {room && (
                <CabinetManager room={room} />
            )}
        </div>
    );
}