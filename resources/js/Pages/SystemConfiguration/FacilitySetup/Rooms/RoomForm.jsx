import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import BedManager from './BedManager';

export default function RoomForm({ room = null, wards = [] }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: room?.name || '',
        ward_id: room?.ward_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        room ? put(route('systemconfiguration5.rooms.update', room.id)) 
             : post(route('systemconfiguration5.rooms.store'));
    };

    return (
        <div className="space-y-6">
            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Room Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <FontAwesomeIcon icon={faDoorOpen} className="mr-2 text-gray-400"/>
                            Room Name / Number *
                        </label>
                        <input 
                            type="text" 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" 
                            required 
                            placeholder="e.g. Room 101"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Ward Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Assign to Ward *</label>
                        <select 
                            value={data.ward_id} 
                            onChange={e => setData('ward_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            required
                        >
                            <option value="">-- Select Ward --</option>
                            {wards.map(ward => (
                                <option key={ward.id} value={ward.id}>{ward.name}</option>
                            ))}
                        </select>
                        {errors.ward_id && <p className="text-red-500 text-xs mt-1">{errors.ward_id}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t pt-4">
                    <Link href={route('systemconfiguration5.rooms.index')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded">Cancel</Link>
                    <button disabled={processing} className="bg-red-600 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-red-700">
                        {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                        {room ? 'Update Room Details' : 'Save Room'}
                    </button>
                </div>
            </form>

            {/* Bed Manager (Only show if editing an existing room) */}
            {room && (
                <BedManager room={room} />
            )}
        </div>
    );
}