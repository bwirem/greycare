import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default function ContactList({ employee }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        relationship: '',
        phone_number: '',
        is_next_of_kin: false,
    });

    const handleAdd = (e) => {
        e.preventDefault();
        post(route('humanresurces0.contacts.store', employee.id), {
            onSuccess: () => reset()
        });
    };

    const handleDelete = (id) => {
        router.delete(route('humanresurces0.contacts.destroy', id));
    };

    return (
        <div className="space-y-6 pt-6">
            {/* List Existing */}
            {employee.contacts && employee.contacts.length > 0 && (
                <div className="overflow-x-auto border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Name</th>
                                <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Relationship</th>
                                <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Phone</th>
                                <th className="px-4 py-2 text-left text-xs uppercase text-gray-500">Next of Kin</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employee.contacts.map(c => (
                                <tr key={c.id}>
                                    <td className="px-4 py-2 text-sm">{c.name}</td>
                                    <td className="px-4 py-2 text-sm">{c.relationship}</td>
                                    <td className="px-4 py-2 text-sm">{c.phone_number}</td>
                                    <td className="px-4 py-2 text-sm">{c.is_next_of_kin ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900"><FontAwesomeIcon icon={faTrash} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add New Form */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h5 className="text-sm font-bold text-gray-700 mb-3">Add Emergency Contact</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs text-gray-600">Name</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full text-sm rounded-md border-gray-300" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600">Relationship</label>
                        <input type="text" value={data.relationship} onChange={e => setData('relationship', e.target.value)} className="w-full text-sm rounded-md border-gray-300" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600">Phone</label>
                        <input type="text" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} className="w-full text-sm rounded-md border-gray-300" />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center text-sm text-gray-700">
                            <input type="checkbox" checked={data.is_next_of_kin} onChange={e => setData('is_next_of_kin', e.target.checked)} className="rounded border-gray-300 text-blue-600 shadow-sm mr-2" />
                            Next of Kin
                        </label>
                        <button onClick={handleAdd} disabled={processing} className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700">Add</button>
                    </div>
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
        </div>
    );
}