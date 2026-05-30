import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/SpecializedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import TextArea from '@/Components/TextArea'; // Ensure you created this in previous steps

export default function EyeCreate({ procedures }) {
    const { data, setData, post, processing, errors } = useForm({
        patient_code: '',
        procedure_id: '',
        scheduled_at: '',
        remarks: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('theatre0.store'));
    };

    return (
        <HospitalLayout header={<h2>Book Eye Procedure</h2>}>
            <Head title="Book Eye Procedure" />

            <div className="py-8 max-w-2xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* Patient Code */}
                        <div>
                            <InputLabel value="Patient Code" />
                            <TextInput 
                                className="w-full mt-1" 
                                placeholder="e.g. PAT-12345"
                                value={data.patient_code}
                                onChange={e => setData('patient_code', e.target.value)}
                                required
                            />
                            {errors.patient_code && <div className="text-red-500 text-sm mt-1">{errors.patient_code}</div>}
                        </div>

                        {/* Procedure Select */}
                        <div>
                            <InputLabel value="Procedure" />
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:ring-indigo-500"
                                value={data.procedure_id}
                                onChange={e => setData('procedure_id', e.target.value)}
                                required
                            >
                                <option value="">Select Procedure...</option>
                                {procedures.map(proc => (
                                    <option key={proc.id} value={proc.id}>{proc.name}</option>
                                ))}
                            </select>
                            {errors.procedure_id && <div className="text-red-500 text-sm mt-1">{errors.procedure_id}</div>}
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
                            {errors.scheduled_at && <div className="text-red-500 text-sm mt-1">{errors.scheduled_at}</div>}
                        </div>

                        {/* Remarks */}
                        <div>
                            <InputLabel value="Remarks / Notes" />
                            <TextArea 
                                className="w-full mt-1"
                                rows="3"
                                value={data.remarks}
                                onChange={e => setData('remarks', e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Link href={route('theatre0.index')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                                Cancel
                            </Link>
                            <PrimaryButton disabled={processing}>
                                Book Procedure
                            </PrimaryButton>
                        </div>

                    </form>
                </div>
            </div>
        </HospitalLayout>
    );
}