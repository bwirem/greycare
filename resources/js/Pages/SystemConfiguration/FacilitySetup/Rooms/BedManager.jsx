import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faProcedures, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function BedManager({ room }) {
    const [newBedName, setNewBedName] = useState('');
    const [loading, setLoading] = useState(false);

    // We don't use useForm for the list to avoid full page reloads on every small action, 
    // but here we use Inertia router manually for granular control.

    const handleAddBed = (e) => {
        e.preventDefault();
        if(!newBedName.trim()) return;
        
        setLoading(true);
        router.post(route('systemconfiguration5.rooms.beds.store', room.id), {
            name: newBedName
        }, {
            preserveScroll: true,
            onSuccess: () => { setNewBedName(''); setLoading(false); },
            onError: () => setLoading(false)
        });
    };

    const handleDeleteBed = (bedId) => {
        if(!confirm('Remove this bed?')) return;
        router.delete(route('systemconfiguration5.rooms.beds.destroy', bedId), {
            preserveScroll: true
        });
    };

    return (
        <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                <FontAwesomeIcon icon={faProcedures} className="mr-2 text-red-500" />
                Manage Beds for {room.name}
            </h3>

            {/* Add Bed Field */}
            <div className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    value={newBedName}
                    onChange={(e) => setNewBedName(e.target.value)}
                    placeholder="Bed Number/Name (e.g. Bed-01)"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                />
                <button 
                    onClick={handleAddBed}
                    disabled={loading || !newBedName}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />} Add
                </button>
            </div>

            {/* Bed List */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {room.beds && room.beds.map((bed) => (
                    <div key={bed.id} className="border rounded-md p-3 flex justify-between items-center bg-gray-50 shadow-sm">
                        <div>
                            <span className="font-bold text-gray-700 block">{bed.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${bed.status === 'Free' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {bed.status}
                            </span>
                        </div>
                        <button 
                            onClick={() => handleDeleteBed(bed.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove Bed"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                ))}
                {(!room.beds || room.beds.length === 0) && (
                    <p className="col-span-full text-gray-500 text-sm italic">No beds assigned to this room yet.</p>
                )}
            </div>
        </div>
    );
}