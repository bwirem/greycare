import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function FacilityForm({ facility = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: facility?.name || '',
        location: facility?.location || '',
        contact_number: facility?.contact_number || '',
        email: facility?.email || '',
        is_active: facility !== null ? !!facility.is_active : true, // Default to true for new creations
    });

    const submit = (e) => {
        e.preventDefault();
        if (facility) {
            put(route('systemconfiguration5.facilities.update', facility.id));
        } else {
            post(route('systemconfiguration5.facilities.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Facility Name <span className="text-red-500">*</span></label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Location / Address</label>
                    <input type="text" value={data.location} onChange={e => setData('location', e.target.value)} className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input type="text" value={data.contact_number} onChange={e => setData('contact_number', e.target.value)} className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="flex items-center h-full pt-6">
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${data.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.is_active ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                            {data.is_active ? 'Status: Active' : 'Status: Inactive'}
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-6">
                <Link href={route('systemconfiguration5.facilities.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-md transition">Cancel</Link>
                <button disabled={processing} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition shadow">
                    {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    {facility ? 'Update Facility' : 'Save Facility'}
                </button>
            </div>
        </form>
    );
}