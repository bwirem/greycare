import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput'; // Or TextArea
import PrimaryButton from '@/Components/PrimaryButton';

export default function TransferCreate({ admission, wards }) {
    const { data, setData, post, processing } = useForm({
        to_ward_id: '',
        to_room_id: '',
        to_bed_id: '',
        reason: ''
    });

    const [selectedWard, setSelectedWard] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        post(route('inpatient2.store', admission.id));
    };

    return (
        <HospitalLayout header={<h2>Transfer Patient</h2>}>
            <Head title="Transfer" />
            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow rounded-lg">
                    
                    {/* Current Location Info */}
                    <div className="bg-gray-50 p-4 mb-6 rounded border">
                        <h3 className="font-bold text-gray-700">Current Location</h3>
                        <p>Patient: {admission.patient.first_name} {admission.patient.last_name}</p>
                        <p>Ward: {admission.ward.name} | Bed: {admission.bed.name}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            {/* Same Ward/Room/Bed Selectors as Admission Form */}
                            <div>
                                <InputLabel value="To Ward" />
                                <select className="w-full border-gray-300 rounded" onChange={e => {
                                    const w = wards.find(w => w.id == e.target.value);
                                    setSelectedWard(w);
                                    setData('to_ward_id', e.target.value);
                                }}>
                                    <option value="">Select...</option>
                                    {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                            
                            {/* ... Room and Bed Selectors mapped similarly ... */}
                             <div>
                                <InputLabel value="To Room" />
                                <select 
                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                    disabled={!selectedWard}
                                    onChange={e => {
                                        const r = selectedWard?.rooms.find(r => r.id == e.target.value);
                                        setSelectedRoom(r);
                                        setData('to_room_id', e.target.value);
                                    }}
                                >
                                    <option value="">Select Room</option>
                                    {selectedWard?.rooms.map(room => (
                                        <option key={room.id} value={room.id}>{room.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Bed Selection */}
                            <div>
                                <InputLabel value="To Bed (Free)" />
                                <select 
                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                    disabled={!selectedRoom}
                                    onChange={e => setData('to_bed_id', e.target.value)}
                                >
                                    <option value="">Select Bed</option>
                                    {selectedRoom?.beds.map(bed => (
                                        <option key={bed.id} value={bed.id}>{bed.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Reason for Transfer" />
                            <TextInput className="w-full" value={data.reason} onChange={e => setData('reason', e.target.value)} />
                        </div>

                        <PrimaryButton disabled={processing}>Process Transfer</PrimaryButton>
                    </form>
                </div>
            </div>
        </HospitalLayout>
    );
}