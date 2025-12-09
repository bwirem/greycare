import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import PrimaryButton from '@/Components/PrimaryButton';
import ReactSelect from 'react-select';

export default function WardRound({ admission, patient, previous_rounds, bb_components }) {
    
    // Dropdown options
    const bloodOptions = bb_components.map(b => ({ value: b.id, label: b.name }));

    const { data, setData, post, processing } = useForm({
        clinical_notes: '',
        treatment_plan: '',
        general_condition: '',
        
        // Orders
        blood_requests: [], // { component_id, units }
        lab_requests: [],
        new_prescriptions: []
    });

    const addBloodRequest = (opt) => {
        setData('blood_requests', [...data.blood_requests, { component_id: opt.value, name: opt.label, units: 1 }]);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('doctor1.store', admission.id));
    };

    return (
        <HospitalLayout header={<h2>Ward Round: {patient.first_name} {patient.last_name}</h2>}>
            <Head title="Ward Round" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: History */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-4 shadow rounded-lg max-h-[600px] overflow-y-auto">
                        <h3 className="font-bold border-b pb-2 mb-4">Round History</h3>
                        {previous_rounds.map(round => (
                            <div key={round.id} className="mb-4 text-sm border-l-2 border-blue-400 pl-3">
                                <div className="text-xs text-gray-500">{new Date(round.round_date).toLocaleString()}</div>
                                <div className="font-bold">{round.doctor?.name}</div>
                                <p className="text-gray-700">{round.clinical_notes}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Round Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={submit} className="bg-white p-6 shadow rounded-lg space-y-6">
                        
                        <div>
                            <InputLabel value="General Condition" />
                            <TextInput className="w-full" placeholder="e.g. Stable, Febrile" value={data.general_condition} onChange={e => setData('general_condition', e.target.value)} />
                        </div>

                        <div>
                            <InputLabel value="Progress Notes" />
                            <TextArea className="w-full" rows={6} value={data.clinical_notes} onChange={e => setData('clinical_notes', e.target.value)} />
                        </div>

                        <div>
                            <InputLabel value="Treatment Plan" />
                            <TextArea className="w-full" rows={4} value={data.treatment_plan} onChange={e => setData('treatment_plan', e.target.value)} />
                        </div>

                        {/* Order Panels */}
                        <div className="bg-red-50 p-4 rounded border border-red-200">
                            <h4 className="font-bold text-red-800 mb-2">Request Blood</h4>
                            <div className="flex gap-2">
                                <div className="w-2/3"><ReactSelect options={bloodOptions} onChange={addBloodRequest} placeholder="Select Component..." /></div>
                            </div>
                            <ul className="mt-2 text-sm list-disc ml-4">
                                {data.blood_requests.map((req, i) => (
                                    <li key={i}>
                                        {req.name} - 
                                        <input 
                                            type="number" className="w-12 h-6 text-xs border rounded mx-2" 
                                            value={req.units} 
                                            onChange={e => {
                                                const list = [...data.blood_requests]; list[i].units = e.target.value; setData('blood_requests', list);
                                            }}
                                        /> 
                                        Units
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <PrimaryButton disabled={processing}>Save Round</PrimaryButton>
                        </div>

                    </form>
                </div>

            </div>
        </HospitalLayout>
    );
}