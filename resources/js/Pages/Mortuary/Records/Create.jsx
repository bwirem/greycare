import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/MortuaryLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faSave } from '@fortawesome/free-solid-svg-icons';

export default function RecordCreate() {
    const { data, setData, post, processing, errors } = useForm({
        patient_code: '',
        first_name: '',
        last_name: '',
        gender: '',
        age: '',
        date_of_death: '',
        cabinet_number: '',
        cause_of_death: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('mortuary0.store'));
    };

    return (
        <HospitalLayout header={<h2>Receive Deceased Body</h2>}>
            <Head title="Receive Body" />

            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={submit} className="bg-white p-8 shadow-sm rounded-lg border border-gray-200">
                    
                    <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">Deceased Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <InputLabel value="Patient Code (Optional if brought in dead)" />
                            <TextInput className="w-full mt-1" value={data.patient_code} onChange={e => setData('patient_code', e.target.value)} />
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

                    <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2 mt-8">Storage & Clinical</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel value="Cabinet / Fridge Number" />
                            <TextInput className="w-full mt-1" placeholder="e.g. Fridge A - Tray 2" value={data.cabinet_number} onChange={e => setData('cabinet_number', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="Presumed Cause of Death" />
                            <TextInput className="w-full mt-1" value={data.cause_of_death} onChange={e => setData('cause_of_death', e.target.value)} />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
                        <Link href={route('mortuary0.index')} className="px-5 py-2 bg-gray-100 border border-gray-300 rounded text-gray-700 font-semibold hover:bg-gray-200">
                            <FontAwesomeIcon icon={faUndo} className="mr-2" /> Cancel
                        </Link>
                        <PrimaryButton disabled={processing} className="px-6 py-2 bg-blue-600">
                            <FontAwesomeIcon icon={faSave} className="mr-2" /> {processing ? 'Saving...' : 'Register Body'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </HospitalLayout>
    );
}