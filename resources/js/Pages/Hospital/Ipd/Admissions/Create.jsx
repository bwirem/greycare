import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBed, faUser,faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

export default function CreateAdmission({ patient, wards, pendingAdmission }) {
    
    // Search state
    const [patientCodeSearch, setPatientCodeSearch] = useState(patient?.code || '');
    
    // Main Form State
    const { data, setData, post, processing, errors } = useForm({
        pending_admission_id: pendingAdmission?.id || '',
        patient_code: patient?.code || '',
        ward_id: pendingAdmission?.ward_id || '',
        room_id: '',
        bed_id: '',
        admission_date: pendingAdmission?.admission_date 
            ? new Date(pendingAdmission.admission_date).toISOString().slice(0, 16) 
            : new Date().toISOString().slice(0, 16)
    });

    // Cascading Dropdown State
    const [roomsList, setRoomsList] = useState([]);
    const [bedsList, setBedsList] = useState([]);

    // 1. Handle Ward Change -> Filter Rooms
    useEffect(() => {
        if (data.ward_id) {
            const selectedWard = wards.find(w => w.id == data.ward_id);
            setRoomsList(selectedWard ? selectedWard.rooms : []);
            setBedsList([]); // Reset beds
            // Only reset room/bed if user changed ward manually (not initial load)
            if(!pendingAdmission || (pendingAdmission && data.ward_id != pendingAdmission.ward_id)) {
                 setData(prev => ({ ...prev, room_id: '', bed_id: '' }));
            }
        }
    }, [data.ward_id]);

    // 2. Handle Room Change -> Filter Beds
    useEffect(() => {
        if (data.room_id) {
            const selectedRoom = roomsList.find(r => r.id == data.room_id);
            setBedsList(selectedRoom ? selectedRoom.beds : []);
        } else {
            setBedsList([]);
        }
    }, [data.room_id, roomsList]);

    const searchPatient = (e) => {
        e.preventDefault();
        router.get(route('inpatient0.create'), { patient_code: patientCodeSearch });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('inpatient0.store'));
    };

    return (
        <HospitalLayout header={<h2>{pendingAdmission ? 'Finalize Bed Assignment' : 'New Admission'}</h2>}>
            <Head title="Admit Patient" />

            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg">
                    
                    {/* --- STEP 1: FIND PATIENT (Hidden if finalizing pending) --- */}
                    {!pendingAdmission && (
                        <div className="mb-8 border-b pb-6 bg-gray-50 p-4 rounded-lg">
                            <InputLabel value="Step 1: Search Patient" className="font-bold text-gray-700 mb-2" />
                            <div className="flex gap-2">
                                <TextInput 
                                    placeholder="Enter Patient Code..." 
                                    value={patientCodeSearch}
                                    onChange={e => setPatientCodeSearch(e.target.value)}
                                    className="w-full md:w-1/2"
                                />
                                <PrimaryButton onClick={searchPatient} className="bg-gray-800">
                                    <FontAwesomeIcon icon={faSearch} className="mr-2" /> Find
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* --- PENDING REQUEST BANNER --- */}
                    {pendingAdmission && (
                        <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded shadow-sm">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-orange-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-orange-700 font-bold">
                                        Pending Admission Request
                                    </p>
                                    <p className="text-sm text-orange-600 mt-1">
                                        Requested Ward: <strong>{pendingAdmission.ward?.name || 'Unspecified'}</strong><br/>
                                        Date: {new Date(pendingAdmission.admission_date).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- STEP 2: ADMISSION DETAILS --- */}
                    {patient ? (
                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* Patient Info Card */}
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-4">
                                <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-blue-900">{patient.first_name} {patient.last_name}</h3>
                                    <p className="text-sm text-blue-700">{patient.code} | {patient.age} Yrs / {patient.gender}</p>
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <InputLabel value="Admission Date" />
                                <TextInput 
                                    type="datetime-local" 
                                    className="w-full md:w-1/3"
                                    value={data.admission_date}
                                    onChange={e => setData('admission_date', e.target.value)}
                                />
                                {errors.admission_date && <p className="text-red-500 text-xs mt-1">{errors.admission_date}</p>}
                            </div>

                            <hr />

                            {/* Location Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Ward */}
                                <div>
                                    <InputLabel value="Ward" />
                                    <select 
                                        className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500"
                                        value={data.ward_id}
                                        onChange={e => setData('ward_id', e.target.value)}
                                    >
                                        <option value="">Select Ward...</option>
                                        {wards.map(ward => (
                                            <option key={ward.id} value={ward.id}>{ward.name}</option>
                                        ))}
                                    </select>
                                    {errors.ward_id && <p className="text-red-500 text-xs mt-1">{errors.ward_id}</p>}
                                </div>

                                {/* Room */}
                                <div>
                                    <InputLabel value="Room" />
                                    <select 
                                        className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500"
                                        disabled={!data.ward_id}
                                        value={data.room_id}
                                        onChange={e => setData('room_id', e.target.value)}
                                    >
                                        <option value="">Select Room...</option>
                                        {roomsList.map(room => (
                                            <option key={room.id} value={room.id}>{room.name}</option>
                                        ))}
                                    </select>
                                    {errors.room_id && <p className="text-red-500 text-xs mt-1">{errors.room_id}</p>}
                                </div>

                                {/* Bed */}
                                <div>
                                    <InputLabel value="Bed (Free Only)" />
                                    <select 
                                        className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-green-500"
                                        disabled={!data.room_id}
                                        value={data.bed_id}
                                        onChange={e => setData('bed_id', e.target.value)}
                                    >
                                        <option value="">Select Bed...</option>
                                        {bedsList.map(bed => (
                                            <option key={bed.id} value={bed.id}>{bed.name}</option>
                                        ))}
                                    </select>
                                    {errors.bed_id && <p className="text-red-500 text-xs mt-1">{errors.bed_id}</p>}
                                    {bedsList.length === 0 && data.room_id && <p className="text-xs text-orange-500 mt-1">No free beds in this room.</p>}
                                </div>
                            </div>

                            <div className="pt-6 border-t">
                                <PrimaryButton disabled={processing} className="w-full justify-center bg-green-600 hover:bg-green-700 h-12 text-lg">
                                    <FontAwesomeIcon icon={faBed} className="mr-2" />
                                    {pendingAdmission ? 'Confirm Bed Assignment' : 'Admit Patient'}
                                </PrimaryButton>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
                            Please search for a patient to continue.
                        </div>
                    )}
                </div>
            </div>
        </HospitalLayout>
    );
}