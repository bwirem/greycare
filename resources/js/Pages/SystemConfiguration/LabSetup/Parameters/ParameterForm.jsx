import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function ParameterForm({ parameter = null, panels }) {
    // Local state for the "Add Option" input field
    const [newOption, setNewOption] = useState('');

    const { data, setData, post, put, processing, errors } = useForm({
        lab_panel_id: parameter?.lab_panel_id || '',
        name: parameter?.name || '',
        result_type: parameter?.result_type || 1, 
        units: parameter?.units || '',
        sort_order: parameter?.sort_order || 0,
        
        // Ranges (Numeric)
        male_min: parameter?.ranges?.[0]?.male_min || 0,
        male_max: parameter?.ranges?.[0]?.male_max || 0,
        female_min: parameter?.ranges?.[0]?.female_min || 0,
        female_max: parameter?.ranges?.[0]?.female_max || 0,

        // Dropdown Options (Array of strings)
        // If editing, map the objects [{id:1, value:'Pos'}] to simple array ['Pos']
        dropdown_options: parameter?.dropdowns ? parameter.dropdowns.map(d => d.value) : [],
    });

    // Helper: Add item to dropdown list
    const handleAddOption = (e) => {
        e.preventDefault(); // Prevent form submit
        if (newOption.trim() !== '') {
            setData('dropdown_options', [...data.dropdown_options, newOption.trim()]);
            setNewOption('');
        }
    };

    // Helper: Remove item from dropdown list
    const handleRemoveOption = (indexToRemove) => {
        setData('dropdown_options', data.dropdown_options.filter((_, index) => index !== indexToRemove));
    };

    const submit = (e) => {
        e.preventDefault();
        if (parameter) {
            put(route('systemconfiguration6.parameters.update', parameter.id));
        } else {
            post(route('systemconfiguration6.parameters.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Panel *</label>
                    <select value={data.lab_panel_id} onChange={e => setData('lab_panel_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                        <option value="">Select Panel</option>
                        {panels.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {errors.lab_panel_id && <p className="text-red-500 text-xs mt-1">{errors.lab_panel_id}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Result Parameter Name *</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g. Blood Group" required />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Result Type</label>
                    <select value={data.result_type} onChange={e => setData('result_type', parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value={1}>Numeric (Min/Max)</option>
                        <option value={2}>Free Text</option>
                        <option value={3}>Dropdown Selection</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Units</label>
                    <input type="text" value={data.units} onChange={e => setData('units', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g. g/dL" />
                </div>
            </div>

            {/* --- Conditional: Numeric Ranges --- */}
            {data.result_type === 1 && (
                <div className="bg-gray-50 p-4 rounded border mt-4">
                    <h4 className="font-bold mb-3 text-sm text-gray-700">Default Normal Ranges</h4>
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-gray-500">Male Min</label>
                            <input type="number" step="0.01" value={data.male_min} onChange={e => setData('male_min', e.target.value)} className="block w-full border-gray-300 rounded shadow-sm text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Male Max</label>
                            <input type="number" step="0.01" value={data.male_max} onChange={e => setData('male_max', e.target.value)} className="block w-full border-gray-300 rounded shadow-sm text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Fem Min</label>
                            <input type="number" step="0.01" value={data.female_min} onChange={e => setData('female_min', e.target.value)} className="block w-full border-gray-300 rounded shadow-sm text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Fem Max</label>
                            <input type="number" step="0.01" value={data.female_max} onChange={e => setData('female_max', e.target.value)} className="block w-full border-gray-300 rounded shadow-sm text-sm" />
                        </div>
                    </div>
                </div>
            )}

            {/* --- Conditional: Dropdown Builder --- */}
            {data.result_type === 3 && (
                <div className="bg-purple-50 p-4 rounded border border-purple-200 mt-4">
                    <h4 className="font-bold mb-3 text-sm text-purple-700">Dropdown Options Configuration</h4>
                    
                    {/* Add New Option Input */}
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            className="flex-1 rounded border-gray-300 shadow-sm text-sm"
                            placeholder="Type option value (e.g. Positive)"
                            value={newOption}
                            onChange={e => setNewOption(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddOption(e)}
                        />
                        <button 
                            type="button"
                            onClick={handleAddOption}
                            className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition"
                        >
                            <FontAwesomeIcon icon={faPlus} /> Add
                        </button>
                    </div>

                    {/* List of Added Options */}
                    {data.dropdown_options.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {data.dropdown_options.map((opt, index) => (
                                <div key={index} className="flex justify-between items-center bg-white border border-purple-200 p-2 rounded shadow-sm">
                                    <span className="text-sm text-gray-700">{opt}</span>
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveOption(index)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                        title="Remove Option"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No options added yet. Type above and click Add.</p>
                    )}
                </div>
            )}

            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration6.parameters.index')} className="text-gray-600 px-4 py-2">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {parameter ? 'Update' : 'Save'}
                </button>
            </div>
        </form>
    );
}