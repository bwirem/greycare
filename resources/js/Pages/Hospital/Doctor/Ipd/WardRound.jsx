import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';

export default function WardRound({ admission, patient, previous_rounds }) {
    
    const { data, setData, post, processing } = useForm({
        // Round Details
        clinical_notes: '', // "Progress in Ward"
        treatment_plan: '',
        general_condition: '',
        
        // Assessment (Specifics)
        has_new_complaint: false,
        systematic_examination: '', // Quick text summary of systems
        
        // Physical Exam (Snapshot for this round)
        pallor: false,
        jaundice: false,
        glasgow_coma_score: '',
        
        // Orders
        new_prescriptions: []
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('doctor.ipd.store', admission.id));
    };

    return (
        <HospitalLayout header={<h2>Ward Round: {patient.first_name} {patient.last_name}</h2>}>
            <Head title="Conduct Ward Round" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: History / Previous Rounds */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-4 shadow rounded-lg">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Previous Rounds</h3>
                        <div className="space-y-4 max-h-screen overflow-y-auto">
                            {previous_rounds.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No previous rounds.</p>
                            ) : (
                                previous_rounds.map(round => (
                                    <div key={round.id} className="text-sm border-l-2 border-indigo-300 pl-3">
                                        <div className="text-xs text-gray-500 font-mono">
                                            {new Date(round.round_date).toLocaleString()}
                                        </div>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {round.doctor?.name}
                                        </div>
                                        <p className="text-gray-600 mt-1 line-clamp-3">
                                            {round.clinical_notes}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Current Round Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={submit} className="bg-white shadow rounded-lg p-6">
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <InputLabel value="General Condition" />
                                    <TextInput 
                                        className="w-full" 
                                        placeholder="e.g. Stable, Improving"
                                        value={data.general_condition}
                                        onChange={e => setData('general_condition', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="GCS" />
                                    <TextInput 
                                        className="w-full" 
                                        placeholder="15/15"
                                        value={data.glasgow_coma_score}
                                        onChange={e => setData('glasgow_coma_score', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <Checkbox checked={data.pallor} onChange={e => setData('pallor', e.target.checked)} />
                                    <span className="ml-2 text-sm">Pallor</span>
                                </label>
                                <label className="flex items-center">
                                    <Checkbox checked={data.jaundice} onChange={e => setData('jaundice', e.target.checked)} />
                                    <span className="ml-2 text-sm">Jaundice</span>
                                </label>
                                <label className="flex items-center">
                                    <Checkbox checked={data.has_new_complaint} onChange={e => setData('has_new_complaint', e.target.checked)} />
                                    <span className="ml-2 text-sm font-bold text-red-600">New Complaints?</span>
                                </label>
                            </div>
                        </div>

                        <div className="mb-6">
                            <InputLabel value="Progress Notes / Clinical Summary" />
                            <TextArea 
                                className="w-full mt-1" 
                                rows={6}
                                placeholder="Patient slept well. Fever subsided..."
                                value={data.clinical_notes}
                                onChange={e => setData('clinical_notes', e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <InputLabel value="Treatment Plan / Instructions" />
                            <TextArea 
                                className="w-full mt-1 border-green-200 focus:border-green-500 focus:ring-green-500" 
                                rows={4}
                                placeholder="Continue current meds. Discharge tomorrow if stable."
                                value={data.treatment_plan}
                                onChange={e => setData('treatment_plan', e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end border-t pt-4">
                            <PrimaryButton disabled={processing}>
                                Save Ward Round
                            </PrimaryButton>
                        </div>

                    </form>
                </div>

            </div>
        </HospitalLayout>
    );
}