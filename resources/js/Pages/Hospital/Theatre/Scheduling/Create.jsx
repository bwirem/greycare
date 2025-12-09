import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function SchedulingCreate({ procedures, doctors, anesthetists }) {
    const { data, setData, post, processing, errors } = useForm({
        patient_code: '',
        procedure_id: '',
        doctor_id: '',
        anesthetist_id: '',
        room: '',
        scheduled_at: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('theatre0.store'));
    };

    return (
        <HospitalLayout header={<h2>Schedule Major Surgery</h2>}>
            <Head title="Schedule Surgery" />

            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    <form onSubmit={submit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Patient Code */}
                            <div>
                                <InputLabel value="Patient Code" />
                                <TextInput 
                                    className="w-full mt-1" 
                                    placeholder="Search Code..."
                                    value={data.patient_code}
                                    onChange={e => setData('patient_code', e.target.value)}
                                    required
                                />
                                {errors.patient_code && <div className="text-red-500 text-sm mt-1">{errors.patient_code}</div>}
                            </div>

                            {/* Procedure */}
                            <div>
                                <InputLabel value="Procedure" />
                                <select 
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1"
                                    value={data.procedure_id}
                                    onChange={e => setData('procedure_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select Procedure...</option>
                                    {procedures.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                {errors.procedure_id && <div className="text-red-500 text-sm mt-1">{errors.procedure_id}</div>}
                            </div>

                            {/* Surgeon */}
                            <div>
                                <InputLabel value="Surgeon" />
                                <select 
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1"
                                    value={data.doctor_id}
                                    onChange={e => setData('doctor_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select Surgeon...</option>
                                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            {/* Anesthetist */}
                            <div>
                                <InputLabel value="Anesthetist (Optional)" />
                                <select 
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1"
                                    value={data.anesthetist_id}
                                    onChange={e => setData('anesthetist_id', e.target.value)}
                                >
                                    <option value="">Select Anesthetist...</option>
                                    {anesthetists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>

                            {/* Theatre Room */}
                            <div>
                                <InputLabel value="Theatre Room" />
                                <select 
                                    className="w-full border-gray-300 rounded-md shadow-sm mt-1"
                                    value={data.room}
                                    onChange={e => setData('room', e.target.value)}
                                    required
                                >
                                    <option value="">Select Room...</option>
                                    <option value="Theatre 1">Theatre 1</option>
                                    <option value="Theatre 2">Theatre 2</option>
                                    <option value="Emergency Theatre">Emergency Theatre</option>
                                </select>
                            </div>

                            {/* Date Time */}
                            <div>
                                <InputLabel value="Scheduled Date & Time" />
                                <TextInput 
                                    type="datetime-local"
                                    className="w-full mt-1"
                                    value={data.scheduled_at}
                                    onChange={e => setData('scheduled_at', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Link href={route('theatre0.index')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                                Cancel
                            </Link>
                            <PrimaryButton disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                Schedule Surgery
                            </PrimaryButton>
                        </div>

                    </form>
                </div>
            </div>
        </HospitalLayout>
    );
}