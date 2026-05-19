import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/MortuaryLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AssignStorage from './AssignStorage';

import {
    faUndo, faSave, faUserInjured, faSkullCrossbones, faFileInvoice,
} from '@fortawesome/free-solid-svg-icons';

export default function RecordCreate({ existingRecord, mortuaries = [], billingGroups = [] }) {
    
    const formatDateTimeLocal = (dateString) => {
        if (!dateString) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            return now.toISOString().slice(0, 16);
        }
        return new Date(dateString).toISOString().slice(0, 16);
    };

    const isUpdate = !!existingRecord;

    const { data, setData, post, put, processing, errors } = useForm({
        patient_code: existingRecord?.patient_code || '',
        first_name: existingRecord?.first_name || '',
        last_name: existingRecord?.last_name || '',
        gender: existingRecord?.gender || '',
        age: existingRecord?.age || '',
        date_of_death: formatDateTimeLocal(existingRecord?.date_of_death),
        cause_of_death: existingRecord?.cause_of_death || '',

        // Mortuary Allocation Data
        mortuary_id: '',
        room_id: '',
        cabinet_id: '',
        billing_group_id: ''
    });

    const [showStorageModal, setShowStorageModal] = useState(false);

    const handleNext = (e) => {
        e.preventDefault();
        setShowStorageModal(true);
    };

    const confirmStorage = () => {
        if (isUpdate) {
            put(route('mortuary0.update', existingRecord.id), {
                onSuccess: () => setShowStorageModal(false)
            });
        } else {
            post(route('mortuary0.store'), {
                onSuccess: () => setShowStorageModal(false)
            });
        }
    };

    return (
        <HospitalLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight flex items-center">
                    <FontAwesomeIcon icon={faSkullCrossbones} className="mr-2 text-blue-600" />
                    {isUpdate ? 'Assign Storage (Ward Body)' : 'Receive New Body'}
                </h2>
            }
        >
            <Head title={isUpdate ? 'Assign Storage' : 'Receive Body'} />

            <div className="py-8 max-w-5xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={handleNext} className="bg-white p-8 shadow-sm rounded-lg border border-gray-200">
                    
                    {/* DECEASED INFORMATION */}
                    <div className="flex items-center border-b pb-3 mb-6">
                        <FontAwesomeIcon icon={faUserInjured} className="text-blue-600 mr-2" />
                        <h3 className="text-lg font-bold text-gray-700">Deceased Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <InputLabel value="Patient Code (Optional)" />
                            <TextInput className="w-full mt-1 bg-gray-50" readOnly={isUpdate && data.patient_code} value={data.patient_code} onChange={e => setData('patient_code', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="First Name *" />
                            <TextInput className="w-full mt-1" required value={data.first_name} onChange={e => setData('first_name', e.target.value)} />
                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                        </div>
                        <div>
                            <InputLabel value="Last Name *" />
                            <TextInput className="w-full mt-1" required value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                        </div>
                        <div>
                            <InputLabel value="Gender *" />
                            <select className="w-full mt-1 border-gray-300 rounded-md shadow-sm" required value={data.gender} onChange={e => setData('gender', e.target.value)}>
                                <option value="">-- Select --</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                        </div>
                        <div>
                            <InputLabel value="Age (Years)" />
                            <TextInput type="number" className="w-full mt-1" value={data.age} onChange={e => setData('age', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="Date & Time of Death *" />
                            <TextInput type="datetime-local" className="w-full mt-1" required value={data.date_of_death} onChange={e => setData('date_of_death', e.target.value)} />
                            {errors.date_of_death && <p className="text-red-500 text-xs mt-1">{errors.date_of_death}</p>}
                        </div>
                    </div>                    

                    {/* CLINICAL */}
                    <div className="flex items-center border-b pb-3 mb-6 mt-10">
                        <FontAwesomeIcon icon={faFileInvoice} className="text-red-600 mr-2" />
                        <h3 className="text-lg font-bold text-gray-700">Clinical Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <InputLabel value="Presumed Cause of Death" />
                            <TextInput className="w-full mt-1" value={data.cause_of_death} onChange={e => setData('cause_of_death', e.target.value)} />
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-10 flex justify-end gap-3 pt-4 border-t">
                        <Link href={route('mortuary0.index')} className="px-5 py-2 bg-gray-100 border border-gray-300 rounded text-gray-700 font-semibold hover:bg-gray-200">
                            <FontAwesomeIcon icon={faUndo} className="mr-2" /> Cancel
                        </Link>
                        <PrimaryButton disabled={processing} className="px-6 py-2 bg-blue-600">
                            <FontAwesomeIcon icon={faSave} className="mr-2" />
                            {processing ? 'Saving...' : 'Next: Assign Storage'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>

            <AssignStorage
                show={showStorageModal} onClose={() => setShowStorageModal(false)} onConfirm={confirmStorage}
                data={data} setData={setData} errors={errors} processing={processing}
                mortuaries={mortuaries} billingGroups={billingGroups}
            />
        </HospitalLayout>
    );
}