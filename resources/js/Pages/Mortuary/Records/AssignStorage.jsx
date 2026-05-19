import React, { useEffect, useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faWarehouse,
    faDoorOpen,
    faArchive,
    faCheck,
    faTimes,
    faSpinner,
    faFileInvoice,
} from '@fortawesome/free-solid-svg-icons';

export default function AssignStorage({
    show,
    onClose,
    onConfirm,
    data,
    setData,
    errors,
    processing,
    mortuaries = [],
    billingGroups = []
}) {

    const [roomsList, setRoomsList] = useState([]);
    const [cabinetsList, setCabinetsList] = useState([]);

    // Load rooms when mortuary changes
    useEffect(() => {
        if (data.mortuary_id) {
            const mortuary = mortuaries.find(m => m.id == data.mortuary_id);

            setRoomsList(mortuary ? mortuary.rooms : []);
            setCabinetsList([]);

        } else {
            setRoomsList([]);
            setCabinetsList([]);
        }
    }, [data.mortuary_id]);

    // Load cabinets when room changes
    useEffect(() => {
        if (data.room_id) {
            const room = roomsList.find(r => r.id == data.room_id);

            setCabinetsList(room ? room.cabinets : []);
        } else {
            setCabinetsList([]);
        }
    }, [data.room_id, roomsList]);

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">

            <div className="p-6">

                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <FontAwesomeIcon icon={faWarehouse} className="mr-2 text-blue-600" />
                        Assign Mortuary Storage
                    </h2>

                    <button onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} className="text-gray-500 hover:text-red-500" />
                    </button>
                </div>

                {/* Patient Summary */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                    <div className="text-sm text-blue-700 uppercase font-bold">
                        Deceased
                    </div>

                    <div className="text-lg font-bold text-blue-900">
                        {data.first_name} {data.last_name}
                    </div>
                </div>

                {/* Storage Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Mortuary */}
                    <div>
                        <InputLabel value="Mortuary *" />

                        <div className="relative mt-1">
                            <span className="absolute left-3 top-3 text-gray-400">
                                <FontAwesomeIcon icon={faWarehouse} />
                            </span>

                            <select
                                className="w-full border-gray-300 rounded-md shadow-sm pl-10"
                                value={data.mortuary_id}
                                onChange={(e) => setData(prev => ({
                                    ...prev,
                                    mortuary_id: e.target.value,
                                    room_id: '',
                                    cabinet_id: ''
                                }))}
                            >
                                <option value="">-- Select Mortuary --</option>

                                {mortuaries.map(mortuary => (
                                    <option key={mortuary.id} value={mortuary.id}>
                                        {mortuary.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {errors.mortuary_id && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.mortuary_id}
                            </p>
                        )}
                    </div>

                    {/* Room */}
                    <div>
                        <InputLabel value="Room *" />

                        <div className="relative mt-1">
                            <span className="absolute left-3 top-3 text-gray-400">
                                <FontAwesomeIcon icon={faDoorOpen} />
                            </span>

                            <select
                                disabled={!data.mortuary_id}
                                className="w-full border-gray-300 rounded-md shadow-sm pl-10 disabled:bg-gray-100"
                                value={data.room_id}
                                onChange={(e) => setData(prev => ({
                                    ...prev,
                                    room_id: e.target.value,
                                    cabinet_id: ''
                                }))}
                            >
                                <option value="">-- Select Room --</option>

                                {roomsList.map(room => (
                                    <option key={room.id} value={room.id}>
                                        {room.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {errors.room_id && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.room_id}
                            </p>
                        )}
                    </div>

                    {/* Cabinet */}
                    <div>
                        <InputLabel value="Cabinet / Tray *" />

                        <div className="relative mt-1">
                            <span className="absolute left-3 top-3 text-gray-400">
                                <FontAwesomeIcon icon={faArchive} />
                            </span>

                            <select
                                disabled={!data.room_id}
                                className="w-full border-gray-300 rounded-md shadow-sm pl-10 disabled:bg-gray-100"
                                value={data.cabinet_id}
                                onChange={(e) => setData('cabinet_id', e.target.value)}
                            >
                                <option value="">-- Select Cabinet --</option>

                                {cabinetsList.map(cabinet => (
                                    <option key={cabinet.id} value={cabinet.id}>
                                        {cabinet.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {errors.cabinet_id && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.cabinet_id}
                            </p>
                        )}
                    </div>
                </div>

                <hr className="border-gray-100" />
                
                {/* Billing Info */}
                <div>
                    <div className="flex items-center mb-3 text-purple-700 font-bold text-sm uppercase border-b border-gray-100 pb-1">
                        <FontAwesomeIcon icon={faFileInvoice} className="mr-2" /> Payment Information
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Payment Mode */}
                        <div className="md:col-span-2">
                            <InputLabel value="Payment Mode *" className="mb-1" />
                            <select
                                value={data.billing_group_id}
                                onChange={e => setData('billing_group_id', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                required
                            >
                                <option value="">Select Mode...</option>
                                {billingGroups.map(bg => (
                                    <option key={bg.id} value={bg.id}>{bg.name}</option>
                                ))}
                            </select>
                            {errors.billing_group_id && <p className="text-red-500 text-xs mt-1">{errors.billing_group_id}</p>}
                        </div>                        
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-end gap-3 border-t pt-4">

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-100 border rounded font-semibold"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="px-6 py-2 bg-green-600 text-white rounded font-bold flex items-center gap-2"
                    >
                        {processing
                            ? <FontAwesomeIcon icon={faSpinner} spin />
                            : <>
                                <FontAwesomeIcon icon={faCheck} />
                                Confirm Storage
                              </>
                        }
                    </button>
                </div>
            </div>
        </Modal>
    );
}