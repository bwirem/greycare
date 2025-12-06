import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faPills, faFlask, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function EditDrugMaster({ auth, product }) {
    const details = product.drug_details || {};
    
    const { data, setData, put, processing, errors } = useForm({
        generic_name: details.generic_name || '',
        formulation_type: details.formulation_type ?? 0, // 0=Solid, 1=Liquid
        strength_amount: details.strength_amount || 0,
        strength_unit: details.strength_unit || 'mg',
        total_volume: details.total_volume || 0,
        volume_unit: details.volume_unit || 'ml',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('systemconfiguration9.drugmaster.update', product.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Configure Drug Details</h2>}>
            <Head title={`Config: ${product.name}`} />
            
            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow sm:rounded-lg">
                    
                    <div className="mb-6 border-b pb-4">
                        <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-500">Inventory Category: {product.category?.name}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* Generic Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                            <input 
                                type="text" 
                                value={data.generic_name} 
                                onChange={e => setData('generic_name', e.target.value)} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                placeholder="e.g. Paracetamol"
                            />
                            {errors.generic_name && <p className="text-red-500 text-xs mt-1">{errors.generic_name}</p>}
                        </div>

                        {/* Formulation Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Formulation Type *</label>
                            <div className="flex gap-4">
                                <label className={`flex items-center px-4 py-3 border rounded-lg cursor-pointer transition-colors ${data.formulation_type == 0 ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="ft" 
                                        value="0" 
                                        checked={data.formulation_type == 0} 
                                        onChange={() => setData('formulation_type', 0)} 
                                        className="mr-3 text-blue-600 focus:ring-blue-500" 
                                    />
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faPills} className="mr-2" size="lg" /> 
                                        <div>
                                            <span className="font-bold block">Solid</span>
                                            <span className="text-xs opacity-75">Tablet, Capsule</span>
                                        </div>
                                    </div>
                                </label>

                                <label className={`flex items-center px-4 py-3 border rounded-lg cursor-pointer transition-colors ${data.formulation_type == 1 ? 'bg-orange-50 border-orange-500 text-orange-700' : 'hover:bg-gray-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="ft" 
                                        value="1" 
                                        checked={data.formulation_type == 1} 
                                        onChange={() => setData('formulation_type', 1)} 
                                        className="mr-3 text-orange-600 focus:ring-orange-500" 
                                    />
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faFlask} className="mr-2" size="lg" /> 
                                        <div>
                                            <span className="font-bold block">Liquid</span>
                                            <span className="text-xs opacity-75">Syrup, Suspension, Injection</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Strength Configuration */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Dosage Strength</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        value={data.strength_amount} 
                                        onChange={e => setData('strength_amount', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                    />
                                    <p className="text-xs text-gray-500 mt-1">e.g., 500 for 500mg</p>
                                    {errors.strength_amount && <p className="text-red-500 text-xs mt-1">{errors.strength_amount}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                                    <select 
                                        value={data.strength_unit} 
                                        onChange={e => setData('strength_unit', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="mg">mg</option>
                                        <option value="g">g</option>
                                        <option value="mcg">mcg</option>
                                        <option value="ml">ml</option>
                                        <option value="iu">IU</option>
                                        <option value="%">%</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Volume Configuration (Liquids Only) */}
                        {data.formulation_type == 1 && (
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 animate-fade-in-down">
                                <h4 className="text-sm font-bold text-orange-800 mb-3 uppercase tracking-wide">Bottle / Vial Configuration</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total Volume per Unit</label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            value={data.total_volume} 
                                            onChange={e => setData('total_volume', e.target.value)} 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" 
                                        />
                                        <p className="text-xs text-gray-500 mt-1">e.g., 100 for a 100ml bottle</p>
                                        {errors.total_volume && <p className="text-red-500 text-xs mt-1">{errors.total_volume}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Volume Unit</label>
                                        <select 
                                            value={data.volume_unit} 
                                            onChange={e => setData('volume_unit', e.target.value)} 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                        >
                                            <option value="ml">ml</option>
                                            <option value="l">L</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Link href={route('systemconfiguration9.drugmaster.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-md transition-colors flex items-center">
                                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cancel
                            </Link>
                            <button 
                                type="submit" 
                                disabled={processing} 
                                className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
                            >
                                {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                                Save Configuration
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}