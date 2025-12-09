import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function CreateAdmission({ patient, wards }) {
    const [patientCodeSearch, setPatientCodeSearch] = useState(patient?.code || '');
    
    // Form State
    const { data, setData, post, processing, errors } = useForm({
        patient_code: patient?.code || '',
        ward_id: '',
        room_id: '',
        bed_id: '',
        admission_date: new Date().toISOString().slice(0, 16) // datetime-local format
    });

    const [selectedWard, setSelectedWard] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const searchPatient = (e) => {
        e.preventDefault();
        router.get(route('inpatient0.create'), { patient_code: patientCodeSearch });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('inpatient0.store'));
    };

    return (
        <HospitalLayout header={<h2>New Admission</h2>}>
            <Head title="Admit Patient" />

            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg">
                    
                    {/* 1. Patient Search */}
                    <div className="mb-6 border-b pb-4">
                        <InputLabel value="Step 1: Find Patient" />
                        <div className="flex gap-2 mt-1">
                            <TextInput 
                                placeholder="Enter Patient Code..." 
                                value={patientCodeSearch}
                                onChange={e => setPatientCodeSearch(e.target.value)}
                                className="w-full"
                            />
                            <PrimaryButton onClick={searchPatient}>Find</PrimaryButton>
                        </div>
                        {patient && (
                            <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded">
                                <strong>Selected:</strong> {patient.first_name} {patient.last_name} ({patient.gender}, {patient.age}y)
                            </div>
                        )}
                    </div>

                    {/* 2. Admission Form */}
                    {patient && (
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel value="Admission Date" />
                                <TextInput 
                                    type="datetime-local" 
                                    className="w-full"
                                    value={data.admission_date}
                                    onChange={e => setData('admission_date', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {/* Ward Selection */}
                                <div>
                                    <InputLabel value="Ward" />
                                    <select 
                                        className="w-full border-gray-300 rounded-md shadow-sm"
                                        onChange={e => {
                                            const w = wards.find(w => w.id == e.target.value);
                                            setSelectedWard(w);
                                            setData('ward_id', e.target.value);
                                        }}
                                    >
                                        <option value="">Select Ward</option>
                                        {wards.map(ward => (
                                            <option key={ward.id} value={ward.id}>{ward.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Room Selection */}
                                <div>
                                    <InputLabel value="Room" />
                                    <select 
                                        className="w-full border-gray-300 rounded-md shadow-sm"
                                        disabled={!selectedWard}
                                        onChange={e => {
                                            const r = selectedWard?.rooms.find(r => r.id == e.target.value);
                                            setSelectedRoom(r);
                                            setData('room_id', e.target.value);
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
                                    <InputLabel value="Bed (Free Only)" />
                                    <select 
                                        className="w-full border-gray-300 rounded-md shadow-sm"
                                        disabled={!selectedRoom}
                                        onChange={e => setData('bed_id', e.target.value)}
                                    >
                                        <option value="">Select Bed</option>
                                        {selectedRoom?.beds.map(bed => (
                                            <option key={bed.id} value={bed.id}>{bed.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4">
                                <PrimaryButton disabled={processing} className="w-full justify-center">
                                    Confirm Admission
                                </PrimaryButton>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </HospitalLayout>
    );
}