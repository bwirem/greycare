import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal'; 
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faBed, faCalendarAlt, faCheck, faTimes, faSpinner, faHospital,
    faFileInvoice, faIdCard, faHashtag
} from "@fortawesome/free-solid-svg-icons";

export default function Admit({ 
    show, 
    onClose, 
    onConfirm, 
    data, 
    setData, 
    errors, 
    wards = [], 
    billingGroups = [], 
    defaultCashGroupId = null, // Receive the prop
    processing,
    pendingAdmission 
}) {
    
    // --- Cascading Dropdown State ---
    const [roomsList, setRoomsList] = useState([]);
    const [bedsList, setBedsList] = useState([]);

    // --- LOGIC: Determine Payment Category (Matches Backend) ---
    const selectedGroup = billingGroups.find(bg => bg.id == data.billinggroup_id);
    
    // Default to 'Cash' (True) until proven otherwise
    let isCash = true; 

    if (selectedGroup) {
        const isExemption = Boolean(selectedGroup.isexemption);
        const isInsurance = Boolean(selectedGroup.isinsurance);
        
        // Backend Logic:
        // 1. Exemption? -> Not Cash (Show Fields)
        // 2. Insurance? -> Not Cash (Show Fields)
        // 3. Invoice? (If FacilityOption exists AND id != defaultCashId) -> Not Cash (Show Fields)
        // 4. Else -> Cash (Hide Fields)

        const isInvoice = defaultCashGroupId && selectedGroup.id != defaultCashGroupId;

        if (isExemption || isInsurance || isInvoice) {
            isCash = false;
        }
    }

    // Auth Check
    const isAuthLinked = data.authorizationno && data.authorizationno.length > 0;

    // --- Ward/Room Logic ---
    useEffect(() => {
        if (data.ward_id && wards.length > 0) {
            const selectedWard = wards.find(w => w.id == data.ward_id);
            setRoomsList(selectedWard ? selectedWard.rooms : []);
        } else {
            setRoomsList([]); setBedsList([]);
        }
    }, [data.ward_id, wards]);

    useEffect(() => {
        if (data.room_id) {
            const selectedRoom = roomsList.find(r => r.id == data.room_id);
            setBedsList(selectedRoom ? selectedRoom.beds : []);
        } else {
            setBedsList([]);
        }
    }, [data.room_id, roomsList]);

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <FontAwesomeIcon icon={faBed} className="mr-2 text-blue-600"/>
                        Confirm Admission Details
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Patient Summary */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded shadow-sm flex justify-between items-center">
                        <div className="text-sm text-blue-900">
                            <span className="block text-xs text-blue-400 uppercase font-bold">Admitting Patient</span>
                            <span className="font-bold text-lg">{data.first_name} {data.last_name}</span>
                        </div>
                        <div className="text-right text-blue-800 text-sm">
                            <span className="bg-blue-200 px-2 py-1 rounded text-xs font-bold mr-2">{data.gender}</span>
                            <span className="font-mono">{data.age ? `${data.age} Yrs` : ''}</span>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <InputLabel value="Admission Date & Time" className="mb-1" />
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                            </span>
                            <TextInput 
                                type="datetime-local" 
                                className="w-full pl-10 border-gray-300 rounded-md shadow-sm"
                                value={data.admission_date}
                                onChange={e => setData('admission_date', e.target.value)}
                            />
                        </div>
                        {errors.admission_date && <p className="text-red-500 text-xs mt-1">{errors.admission_date}</p>}
                    </div>

                    <hr className="border-gray-100" />

                    {/* Ward Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <InputLabel value="Ward" />
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm mt-1"
                                value={data.ward_id}
                                onChange={e => setData(prev => ({ ...prev, ward_id: e.target.value, room_id: '', bed_id: '' }))}
                            >
                                <option value="">-- Select Ward --</option>
                                {wards.map(ward => (
                                    <option key={ward.id} value={ward.id}>{ward.name}</option>
                                ))}
                            </select>
                            {errors.ward_id && <p className="text-red-500 text-xs mt-1">{errors.ward_id}</p>}
                        </div>

                        <div>
                            <InputLabel value="Room" />
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm mt-1 disabled:bg-gray-100"
                                disabled={!data.ward_id}
                                value={data.room_id}
                                onChange={e => setData(prev => ({ ...prev, room_id: e.target.value, bed_id: '' }))}
                            >
                                <option value="">-- Select Room --</option>
                                {roomsList.map(room => (
                                    <option key={room.id} value={room.id}>{room.name}</option>
                                ))}
                            </select>
                            {errors.room_id && <p className="text-red-500 text-xs mt-1">{errors.room_id}</p>}
                        </div>

                        <div>
                            <InputLabel value="Bed (Free Only)" />
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm mt-1 disabled:bg-gray-100"
                                disabled={!data.room_id}
                                value={data.bed_id}
                                onChange={e => setData('bed_id', e.target.value)}
                            >
                                <option value="">-- Select Bed --</option>
                                {bedsList.map(bed => (
                                    <option key={bed.id} value={bed.id}>{bed.name}</option>
                                ))}
                            </select>
                            {errors.bed_id && <p className="text-red-500 text-xs mt-1">{errors.bed_id}</p>}
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
                                    value={data.billinggroup_id}
                                    onChange={e => setData('billinggroup_id', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    required
                                >
                                    <option value="">Select Mode...</option>
                                    {billingGroups.map(bg => (
                                        <option key={bg.id} value={bg.id}>{bg.name}</option>
                                    ))}
                                </select>
                                {errors.billinggroup_id && <p className="text-red-500 text-xs mt-1">{errors.billinggroup_id}</p>}
                            </div>

                            {/* HIDDEN IF CASH: Insurance Details */}
                            {!isCash && (
                                <>
                                    <div>
                                        <InputLabel className="mb-1">
                                            <FontAwesomeIcon icon={faIdCard} className="mr-1 text-gray-500"/> Card Number
                                        </InputLabel>
                                        <TextInput
                                            value={data.billinggroupmembershipno}
                                            onChange={e => setData('billinggroupmembershipno', e.target.value)}
                                            className="w-full bg-gray-50 text-sm shadow-sm"
                                            placeholder="Member No"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel className="mb-1">
                                            <FontAwesomeIcon icon={faCheck} className="mr-1 text-gray-500"/> Auth Number
                                        </InputLabel>
                                        <TextInput
                                            value={data.authorizationno}
                                            onChange={e => setData('authorizationno', e.target.value)}
                                            className={`w-full text-sm shadow-sm font-bold ${isAuthLinked ? 'bg-green-50 text-green-800' : 'bg-gray-50'}`}
                                            placeholder="Auth No"
                                            readOnly={isAuthLinked}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <InputLabel className="mb-1">
                                            <FontAwesomeIcon icon={faHashtag} className="mr-1 text-gray-500"/> Scheme / Product ID
                                        </InputLabel>
                                        <TextInput
                                            value={data.schemeid}
                                            onChange={e => setData('schemeid', e.target.value)}
                                            className="w-full bg-gray-50 text-sm shadow-sm"
                                            placeholder="Scheme ID"
                                            readOnly={isAuthLinked}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button onClick={onClose} className="px-5 py-2 bg-white border border-gray-300 rounded text-gray-700 font-semibold" disabled={processing}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={processing} className="px-6 py-2 bg-green-600 text-white rounded font-bold flex items-center gap-2">
                        {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faCheck} /> Confirm Admission</>}
                    </button>
                </div>
            </div>
        </Modal>
    );
}