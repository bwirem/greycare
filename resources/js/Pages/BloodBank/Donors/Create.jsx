import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function CreateDonor() {
    
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        surname: '',
        gender: 'Male',
        birthdate: '',
        contact_no: '',
        blood_group: '',
        weight: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('bloodbank0.store'));
    };

    return (
        <HospitalLayout header={<h2>Register New Donor</h2>}>
            <Head title="New Donor" />

            <div className="py-8 max-w-2xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={submit} className="bg-white p-6 shadow rounded-lg">
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel value="First Name" />
                            <TextInput className="w-full" value={data.first_name} onChange={e => setData('first_name', e.target.value)} required />
                        </div>
                        <div>
                            <InputLabel value="Surname" />
                            <TextInput className="w-full" value={data.surname} onChange={e => setData('surname', e.target.value)} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel value="Gender" />
                            <select className="w-full border-gray-300 rounded" value={data.gender} onChange={e => setData('gender', e.target.value)}>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Date of Birth" />
                            <TextInput type="date" className="w-full" value={data.birthdate} onChange={e => setData('birthdate', e.target.value)} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel value="Blood Group (Optional)" />
                            <select className="w-full border-gray-300 rounded" value={data.blood_group} onChange={e => setData('blood_group', e.target.value)}>
                                <option value="">Unknown</option>
                                <option>A+</option><option>A-</option>
                                <option>B+</option><option>B-</option>
                                <option>AB+</option><option>AB-</option>
                                <option>O+</option><option>O-</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Weight (Kg)" />
                            <TextInput type="number" step="0.1" className="w-full" value={data.weight} onChange={e => setData('weight', e.target.value)} required />
                        </div>
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Contact Phone" />
                        <TextInput className="w-full" value={data.contact_no} onChange={e => setData('contact_no', e.target.value)} required />
                    </div>

                    <PrimaryButton className="w-full justify-center" disabled={processing}>
                        Register Donor
                    </PrimaryButton>

                </form>
            </div>
        </HospitalLayout>
    );
}