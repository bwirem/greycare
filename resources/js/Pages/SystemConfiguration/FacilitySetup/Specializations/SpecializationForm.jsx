import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faCalendarAlt, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

export default function SpecializationForm({ specialization = null, billItems = [] }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: specialization?.name || '',
        revisit_days: specialization?.revisit_days || 7,
        new_visit_item_id: specialization?.new_visit_item_id || '',
        revisit_item_id: specialization?.revisit_item_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (specialization) {
            put(route('systemconfiguration5.specializations.update', specialization.id));
        } else {
            post(route('systemconfiguration5.specializations.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-8">
            
            {/* Section 1: Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Specialization Name *</label>
                        <input 
                            type="text" 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500" 
                            required 
                            placeholder="e.g. General Practice, Dentistry"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Revisit Window (Days) *</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                            </div>
                            <input 
                                type="number" 
                                min="0"
                                value={data.revisit_days} 
                                onChange={e => setData('revisit_days', e.target.value)} 
                                className="pl-10 w-full border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" 
                                required 
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Number of days a return visit is considered a "Revisit".</p>
                        {errors.revisit_days && <p className="text-red-500 text-xs mt-1">{errors.revisit_days}</p>}
                    </div>
                </div>
            </div>

            {/* Section 2: Pricing Rules */}
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h3 className="text-sm font-bold text-emerald-800 uppercase mb-4 border-b border-emerald-200 pb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faMoneyBillWave} /> Charging Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* New Visit Rule */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Charge for New Case *</label>
                        <select 
                            value={data.new_visit_item_id} 
                            onChange={e => setData('new_visit_item_id', e.target.value)} 
                            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                            required
                        >
                            <option value="">-- Select Billing Item --</option>
                            {billItems.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({parseFloat(item.price1).toLocaleString()})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Charged for first visit or after revisit window expires.</p>
                        {errors.new_visit_item_id && <p className="text-red-500 text-xs mt-1">{errors.new_visit_item_id}</p>}
                    </div>

                    {/* Revisit Rule */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Charge for Revisit *</label>
                        <select 
                            value={data.revisit_item_id} 
                            onChange={e => setData('revisit_item_id', e.target.value)} 
                            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                            required
                        >
                            <option value="">-- Select Billing Item --</option>
                            {billItems.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({parseFloat(item.price1).toLocaleString()})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Charged if patient returns within {data.revisit_days} days.</p>
                        {errors.revisit_item_id && <p className="text-red-500 text-xs mt-1">{errors.revisit_item_id}</p>}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration5.specializations.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-50 rounded transition">Cancel</Link>
                <button disabled={processing} className="bg-emerald-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-emerald-700 shadow-sm disabled:opacity-50">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {specialization ? 'Update Specialization' : 'Save Specialization'}
                </button>
            </div>
        </form>
    );
}