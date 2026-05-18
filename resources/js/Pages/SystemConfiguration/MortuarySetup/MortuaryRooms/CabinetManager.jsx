import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faBoxArchive, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function CabinetManager({ room }) {
    const [newCabinetName, setNewCabinetName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddCabinet = (e) => {
        e.preventDefault();
        if(!newCabinetName.trim()) return;
        
        setLoading(true);
        router.post(route('systemconfiguration16.rooms.cabinets.store', room.id), {
            name: newCabinetName
        }, {
            preserveScroll: true,
            onSuccess: () => { setNewCabinetName(''); setLoading(false); },
            onError: () => setLoading(false)
        });
    };

    const handleDeleteCabinet = (cabinetId) => {
        if(!confirm('Remove this cabinet/tray?')) return;
        router.delete(route('systemconfiguration16.rooms.cabinets.destroy', cabinetId), {
            preserveScroll: true
        });
    };

    return (
        <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
                <FontAwesomeIcon icon={faBoxArchive} className="mr-2 text-indigo-500" />
                Manage Cabinets / Trays for {room.name}
            </h3>

            {/* Add Cabinet Field */}
            <div className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    value={newCabinetName}
                    onChange={(e) => setNewCabinetName(e.target.value)}
                    placeholder="Cabinet/Tray Number (e.g. Tray-01)"
                    className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button 
                    onClick={handleAddCabinet}
                    disabled={loading || !newCabinetName}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />} Add
                </button>
            </div>

            {/* Cabinet List */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {room.cabinets && room.cabinets.map((cabinet) => (
                    <div key={cabinet.id} className="border border-slate-200 rounded-md p-3 flex justify-between items-center bg-slate-50 shadow-sm">
                        <div>
                            <span className="font-bold text-slate-700 block">{cabinet.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${cabinet.status === 'Free' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {cabinet.status}
                            </span>
                        </div>
                        <button 
                            onClick={() => handleDeleteCabinet(cabinet.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove Cabinet"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                ))}
                {(!room.cabinets || room.cabinets.length === 0) && (
                    <p className="col-span-full text-slate-500 text-sm italic">No cabinets assigned to this room yet.</p>
                )}
            </div>
        </div>
    );
}