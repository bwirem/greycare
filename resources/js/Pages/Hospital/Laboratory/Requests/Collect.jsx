import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function CollectSample({ request, patient, panel, sample_types, rejection_reasons }) {
    
    const { data, setData, post, processing } = useForm({
        lab_nature_of_sample_id: panel.lab_nature_of_sample_id || '', // Default from panel
        collection_date: new Date().toISOString().slice(0, 16),
        notes: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('laboratory0.store', request.id));
    };

    return (
        <HospitalLayout header={<h2>Sample Collection</h2>}>
            <Head title="Collect Sample" />

            <div className="py-8 max-w-2xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow rounded-lg">
                    
                    {/* Header Info */}
                    <div className="mb-6 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="font-bold text-lg">{patient.first_name} {patient.last_name}</h3>
                                <p className="text-sm text-gray-600">ID: {patient.code} | Age: {patient.age}y</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs uppercase text-gray-500">Test Requested</span>
                                <span className="font-bold text-indigo-700 text-xl">{panel.name}</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        
                        <div>
                            <InputLabel value="Nature of Sample" />
                            <select 
                                className="w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500"
                                value={data.lab_nature_of_sample_id}
                                onChange={e => setData('lab_nature_of_sample_id', e.target.value)}
                                required
                            >
                                <option value="">Select Sample Type...</option>
                                {sample_types.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Collection Date/Time" />
                            <TextInput 
                                type="datetime-local" 
                                className="w-full"
                                value={data.collection_date}
                                onChange={e => setData('collection_date', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Lab Notes / Comments" />
                            <textarea 
                                className="w-full border-gray-300 rounded shadow-sm"
                                rows="3"
                                placeholder="e.g. Hemolyzed sample warning..."
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex justify-between pt-4 border-t">
                            <button type="button" className="text-red-600 text-sm underline hover:text-red-800">
                                Reject Request
                            </button>
                            <PrimaryButton disabled={processing}>
                                Confirm Collection
                            </PrimaryButton>
                        </div>

                    </form>
                </div>
            </div>
        </HospitalLayout>
    );
}