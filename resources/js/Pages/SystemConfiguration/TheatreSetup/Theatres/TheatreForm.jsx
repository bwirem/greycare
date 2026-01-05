import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function TheatreForm({ theatre = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: theatre?.name || '',
        code: theatre?.code || '',
        type: theatre?.type || 'General', // Default to General
        location: theatre?.location || '',
        is_active: theatre ? Boolean(theatre.is_active) : true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (theatre) {
            put(route('systemconfiguration8.theatres.update', theatre.id));
        } else {
            post(route('systemconfiguration8.theatres.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            
            {/* Row 1: Name & Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Theatre Name *</label>
                    <input 
                        type="text" 
                        value={data.name} 
                        onChange={e => setData('name', e.target.value)} 
                        className="w-full border rounded p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="e.g. Main OT"
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
                        className="w-full border rounded p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="e.g. OT-01"
                    />
                </div>
            </div>

            {/* Row 2: Type & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Theatre Type</label>
                    <select 
                        value={data.type} 
                        onChange={e => setData('type', e.target.value)} 
                        className="w-full border rounded p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="General">General Surgery</option>
                        <option value="Minor">Minor Procedure Room</option>
                        <option value="Orthopedic">Orthopedic</option>
                        <option value="Cardiothoracic">Cardiothoracic</option>
                        <option value="Maternity">Maternity / Labour Ward</option>
                        <option value="Recovery">Recovery Room</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input 
                        type="text" 
                        value={data.location} 
                        onChange={e => setData('location', e.target.value)} 
                        className="w-full border rounded p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="e.g. 2nd Floor, Wing B"
                    />
                </div>
            </div>

            {/* Row 3: Status */}
            <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={data.is_active} 
                        onChange={e => setData('is_active', e.target.checked)} 
                        className="mr-2 rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm text-gray-700">Active / Operational</span>
                </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 border-t pt-4">
                <Link href={route('systemconfiguration8.theatres.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {theatre ? 'Update Theatre' : 'Save Theatre'}
                </button>
            </div>
        </form>
    );
}