import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import TextArea from '@/Components/TextArea'; // Assume standard textarea component
import PrimaryButton from '@/Components/PrimaryButton';

export default function OpdConsultation({ booking, patient, vital_signs, existing_history, existing_exam }) {
    
    // Initialize form with existing data or defaults
    const { data, setData, post, processing, errors } = useForm({
        // History
        history_presenting_illness: existing_history?.history_presenting_illness || '',
        past_medical_history: existing_history?.past_medical_history || '',
        complaints: existing_history?.complains || [{ chief_complaint: '', duration: '' }],
        
        // Examination (Polymorphic mapped)
        general_condition: existing_exam?.general_condition || '',
        glasgow_coma_score: existing_exam?.glasgow_coma_score || '',
        pallor: existing_exam?.pallor === 1,
        jaundice: existing_exam?.jaundice === 1,
        cvs_examination: existing_exam?.cvs_examination || '',
        rs_examination: existing_exam?.rs_examination || '',
        abdomen_examination: existing_exam?.abdomen_examination || '',
        
        // Diagnosis & Rx (New entries)
        diagnoses: [{ name: '', code: '' }], 
        prescriptions: [] 
    });

    const [activeTab, setActiveTab] = useState('history');

    // --- Helper Functions for Dynamic Arrays ---
    const addComplaint = () => setData('complaints', [...data.complaints, { chief_complaint: '', duration: '' }]);
    const removeComplaint = (index) => {
        const list = [...data.complaints];
        list.splice(index, 1);
        setData('complaints', list);
    };

    const addPrescription = () => setData('prescriptions', [...data.prescriptions, { product_id: '', dosage: '', frequency: 'TID', duration: '5 days', quantity: 1 }]);
    
    const submit = (e) => {
        e.preventDefault();
        post(route('doctor.opd.store', booking.id));
    };

    return (
        <HospitalLayout header={<h2>Consultation: {patient.first_name} {patient.last_name} ({patient.age}y)</h2>}>
            <Head title="Clinical Consultation" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Vitals Header Widget */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 shadow-sm">
                    <div className="flex space-x-6 text-sm text-gray-700">
                        <span className="font-bold">BP: {vital_signs?.blood_pressure || 'N/A'}</span>
                        <span className="font-bold">Temp: {vital_signs?.temperature || 'N/A'}°C</span>
                        <span className="font-bold">Pulse: {vital_signs?.pulse || 'N/A'}</span>
                        <span className="font-bold">Weight: {vital_signs?.weight || 'N/A'}kg</span>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        
                        {/* Tabs Navigation */}
                        <div className="flex border-b bg-gray-100">
                            {['history', 'examination', 'diagnosis_plan'].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-4 text-sm font-medium uppercase ${
                                        activeTab === tab ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            
                            {/* --- TAB 1: HISTORY --- */}
                            {activeTab === 'history' && (
                                <div className="space-y-6">
                                    {/* Dynamic Complaints Grid */}
                                    <div>
                                        <h3 className="font-bold text-gray-700 mb-2">Chief Complaints</h3>
                                        {data.complaints.map((item, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <TextInput 
                                                    placeholder="Complaint (e.g. Fever)" 
                                                    className="w-2/3"
                                                    value={item.chief_complaint}
                                                    onChange={e => {
                                                        const list = [...data.complaints];
                                                        list[index].chief_complaint = e.target.value;
                                                        setData('complaints', list);
                                                    }}
                                                />
                                                <TextInput 
                                                    placeholder="Duration (e.g. 3 days)" 
                                                    className="w-1/3"
                                                    value={item.duration}
                                                    onChange={e => {
                                                        const list = [...data.complaints];
                                                        list[index].duration = e.target.value;
                                                        setData('complaints', list);
                                                    }}
                                                />
                                                <button type="button" onClick={() => removeComplaint(index)} className="text-red-500 px-2">X</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addComplaint} className="text-sm text-blue-600 underline">+ Add Complaint</button>
                                    </div>

                                    <div>
                                        <InputLabel value="History of Presenting Illness (HPI)" />
                                        <TextArea 
                                            className="w-full mt-1" rows={4}
                                            value={data.history_presenting_illness}
                                            onChange={e => setData('history_presenting_illness', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Past Medical History" />
                                        <TextArea 
                                            className="w-full mt-1" rows={3}
                                            value={data.past_medical_history}
                                            onChange={e => setData('past_medical_history', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 2: EXAMINATION --- */}
                            {activeTab === 'examination' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel value="General Condition" />
                                            <TextInput 
                                                className="w-full" 
                                                value={data.general_condition}
                                                onChange={e => setData('general_condition', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="GCS (e.g. 15/15)" />
                                            <TextInput 
                                                className="w-full" 
                                                value={data.glasgow_coma_score}
                                                onChange={e => setData('glasgow_coma_score', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-6 mt-4">
                                        <label className="flex items-center">
                                            <Checkbox checked={data.pallor} onChange={e => setData('pallor', e.target.checked)} />
                                            <span className="ml-2 text-sm text-gray-600">Pallor</span>
                                        </label>
                                        <label className="flex items-center">
                                            <Checkbox checked={data.jaundice} onChange={e => setData('jaundice', e.target.checked)} />
                                            <span className="ml-2 text-sm text-gray-600">Jaundice</span>
                                        </label>
                                        {/* Add other checkboxes here */}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div>
                                            <InputLabel value="Respiratory System" />
                                            <TextArea className="w-full" rows={3} value={data.rs_examination} onChange={e => setData('rs_examination', e.target.value)} />
                                        </div>
                                        <div>
                                            <InputLabel value="Cardiovascular System" />
                                            <TextArea className="w-full" rows={3} value={data.cvs_examination} onChange={e => setData('cvs_examination', e.target.value)} />
                                        </div>
                                        <div>
                                            <InputLabel value="Abdomen / GI" />
                                            <TextArea className="w-full" rows={3} value={data.abdomen_examination} onChange={e => setData('abdomen_examination', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB 3: DIAGNOSIS & PLAN --- */}
                            {activeTab === 'diagnosis_plan' && (
                                <div className="space-y-6">
                                    {/* Diagnosis Adder */}
                                    <div className="border p-4 rounded bg-gray-50">
                                        <h3 className="font-bold mb-2">Diagnosis</h3>
                                        <TextInput 
                                            placeholder="Enter Provisional Diagnosis"
                                            className="w-full"
                                            value={data.diagnoses[0].name}
                                            onChange={e => {
                                                const list = [...data.diagnoses];
                                                list[0].name = e.target.value;
                                                setData('diagnoses', list);
                                            }}
                                        />
                                    </div>

                                    {/* Prescription Adder */}
                                    <div className="border p-4 rounded bg-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold">Prescription / Medication</h3>
                                            <button type="button" onClick={addPrescription} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Add Drug</button>
                                        </div>
                                        
                                        {data.prescriptions.map((rx, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
                                                <div className="col-span-4">
                                                    <InputLabel value="Drug / Item ID" className="text-xs" />
                                                    <TextInput 
                                                        className="w-full text-sm" placeholder="Search Product..."
                                                        value={rx.product_id}
                                                        onChange={e => {
                                                            const list = [...data.prescriptions];
                                                            list[idx].product_id = e.target.value; // Ideally a Dropdown
                                                            setData('prescriptions', list);
                                                        }} 
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <TextInput className="w-full text-sm" placeholder="Dose (500mg)" value={rx.dosage} onChange={e => {
                                                        const list = [...data.prescriptions]; list[idx].dosage = e.target.value; setData('prescriptions', list);
                                                    }} />
                                                </div>
                                                <div className="col-span-2">
                                                    <TextInput className="w-full text-sm" placeholder="Freq (TID)" value={rx.frequency} onChange={e => {
                                                        const list = [...data.prescriptions]; list[idx].frequency = e.target.value; setData('prescriptions', list);
                                                    }} />
                                                </div>
                                                <div className="col-span-2">
                                                    <TextInput className="w-full text-sm" placeholder="Qty" type="number" value={rx.quantity} onChange={e => {
                                                        const list = [...data.prescriptions]; list[idx].quantity = e.target.value; setData('prescriptions', list);
                                                    }} />
                                                </div>
                                                <div className="col-span-1">
                                                    <button type="button" onClick={() => {
                                                        const list = [...data.prescriptions]; list.splice(idx, 1); setData('prescriptions', list);
                                                    }} className="text-red-500 font-bold">X</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <PrimaryButton disabled={processing}>
                                Save Consultation
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </HospitalLayout>
    );
}