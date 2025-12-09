import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import TextArea from '@/Components/TextArea';
import PrimaryButton from '@/Components/PrimaryButton';
import ReactSelect from 'react-select'; // Need to install react-select

export default function OpdConsultation({ 
    booking, patient, vital_signs, existing_history, existing_exam, 
    icd_list, lab_panels, rad_procedures, drugs_list, surgery_procedures 
}) {
    
    // Transform options for React Select
    const icdOptions = icd_list.map(d => ({ value: d.id, label: `${d.code} - ${d.name}` }));
    const labOptions = lab_panels.map(l => ({ value: l.id, label: l.name }));
    const radOptions = rad_procedures.map(r => ({ value: r.id, label: r.name }));
    const drugOptions = drugs_list.map(d => ({ value: d.id, label: d.name }));
    const surgeryOptions = surgery_procedures.map(s => ({ value: s.id, label: s.name }));

    const { data, setData, post, processing } = useForm({
        // History
        history_presenting_illness: existing_history?.history_presenting_illness || '',
        complaints: existing_history?.complains || [{ chief_complaint: '', duration: '' }],
        
        // Exam
        general_condition: existing_exam?.general_condition || '',
        pallor: existing_exam?.pallor === 1,
        
        // Diagnoses
        diagnoses: [], // { id, label, type: 'icd', status: 'provisional' }
        
        // Orders
        prescriptions: [],
        lab_requests: [],
        rad_requests: [],
        surgery_request: { procedure_id: '', date: '' }
    });

    const [activeTab, setActiveTab] = useState('history');

    // --- Dynamic Adders ---
    const addOrder = (field, item) => setData(field, [...data[field], item]);
    const removeOrder = (field, idx) => {
        const list = [...data[field]]; list.splice(idx, 1); setData(field, list);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('doctor0.store', booking.id));
    };

    return (
        <HospitalLayout header={<h2>OPD Consultation: {patient.first_name}</h2>}>
            <Head title="Consultation" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Vitals Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex gap-6 text-sm shadow-sm">
                    <span className="font-bold">BP: {vital_signs?.blood_pressure || '-'}</span>
                    <span className="font-bold">Temp: {vital_signs?.temperature || '-'}°C</span>
                    <span className="font-bold">Pulse: {vital_signs?.pulse || '-'}</span>
                </div>

                <form onSubmit={submit}>
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        
                        {/* Tabs */}
                        <div className="flex border-b bg-gray-100">
                            {['history', 'exam', 'diagnosis', 'orders'].map(tab => (
                                <button
                                    key={tab} type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 font-bold uppercase text-sm ${activeTab === tab ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 min-h-[400px]">
                            
                            {/* --- HISTORY --- */}
                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    <InputLabel value="Chief Complaints" />
                                    {data.complaints.map((c, i) => (
                                        <div key={i} className="flex gap-2">
                                            <TextInput placeholder="Complaint" className="w-2/3" value={c.chief_complaint} onChange={e => {
                                                const list = [...data.complaints]; list[i].chief_complaint = e.target.value; setData('complaints', list);
                                            }} />
                                            <TextInput placeholder="Duration" className="w-1/3" value={c.duration} onChange={e => {
                                                const list = [...data.complaints]; list[i].duration = e.target.value; setData('complaints', list);
                                            }} />
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addOrder('complaints', {chief_complaint:'', duration:''})} className="text-blue-600 text-sm">+ Add</button>
                                    
                                    <InputLabel value="HPI" className="mt-4"/>
                                    <TextArea className="w-full" rows={4} value={data.history_presenting_illness} onChange={e => setData('history_presenting_illness', e.target.value)} />
                                </div>
                            )}

                            {/* --- EXAM --- */}
                            {activeTab === 'exam' && (
                                <div className="space-y-4">
                                    <InputLabel value="General Condition" />
                                    <TextInput className="w-full" value={data.general_condition} onChange={e => setData('general_condition', e.target.value)} />
                                    
                                    <label className="flex items-center gap-2 mt-4">
                                        <Checkbox checked={data.pallor} onChange={e => setData('pallor', e.target.checked)} />
                                        <span>Pallor</span>
                                    </label>
                                </div>
                            )}

                            {/* --- DIAGNOSIS --- */}
                            {activeTab === 'diagnosis' && (
                                <div className="space-y-4">
                                    <InputLabel value="Add ICD Diagnosis" />
                                    <ReactSelect 
                                        options={icdOptions} 
                                        onChange={opt => addOrder('diagnoses', { id: opt.value, label: opt.label, type: 'icd', status: 'provisional' })}
                                    />
                                    
                                    <div className="mt-4 space-y-2">
                                        {data.diagnoses.map((d, i) => (
                                            <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                <span>{d.label}</span>
                                                <div className="flex gap-2">
                                                    <select 
                                                        className="text-sm border-gray-300 rounded"
                                                        value={d.status}
                                                        onChange={e => {
                                                            const list = [...data.diagnoses]; list[i].status = e.target.value; setData('diagnoses', list);
                                                        }}
                                                    >
                                                        <option value="provisional">Provisional</option>
                                                        <option value="confirmed">Confirmed</option>
                                                    </select>
                                                    <button type="button" onClick={() => removeOrder('diagnoses', i)} className="text-red-500">X</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- ORDERS --- */}
                            {activeTab === 'orders' && (
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Lab */}
                                    <div className="border p-3 rounded">
                                        <h3 className="font-bold mb-2">Lab Requests</h3>
                                        <ReactSelect options={labOptions} onChange={opt => addOrder('lab_requests', { panel_id: opt.value, name: opt.label })} />
                                        <ul className="mt-2 text-sm text-gray-600 list-disc ml-4">
                                            {data.lab_requests.map((l, i) => <li key={i}>{l.name} <button type="button" onClick={()=>removeOrder('lab_requests', i)} className="text-red-500 ml-2">x</button></li>)}
                                        </ul>
                                    </div>

                                    {/* Radiology */}
                                    <div className="border p-3 rounded">
                                        <h3 className="font-bold mb-2">Radiology</h3>
                                        <ReactSelect options={radOptions} onChange={opt => addOrder('rad_requests', { procedure_id: opt.value, name: opt.label })} />
                                        <ul className="mt-2 text-sm text-gray-600 list-disc ml-4">
                                            {data.rad_requests.map((r, i) => <li key={i}>{r.name} <button type="button" onClick={()=>removeOrder('rad_requests', i)} className="text-red-500 ml-2">x</button></li>)}
                                        </ul>
                                    </div>

                                    {/* Pharmacy */}
                                    <div className="border p-3 rounded col-span-2">
                                        <h3 className="font-bold mb-2">Prescription</h3>
                                        <div className="flex gap-2 mb-2">
                                            <div className="w-1/3"><ReactSelect placeholder="Drug..." options={drugOptions} id="drugSelect" /></div>
                                            <TextInput placeholder="Dose" id="dose" className="w-1/6" />
                                            <TextInput placeholder="Freq" id="freq" className="w-1/6" />
                                            <TextInput placeholder="Qty" id="qty" type="number" className="w-1/6" />
                                            <button type="button" 
                                                onClick={() => {
                                                    // Simple implementation - grab values from DOM or state
                                                    // In real app, use controlled inputs
                                                    addOrder('prescriptions', { product_id: 1, name: 'Paracetamol', dosage: '500mg', frequency: 'TID', quantity: 10 });
                                                }}
                                                className="bg-blue-100 text-blue-800 px-3 rounded"
                                            >Add</button>
                                        </div>
                                        {/* List Prescriptions */}
                                        {data.prescriptions.map((p, i) => (
                                            <div key={i} className="text-sm border-b py-1 flex justify-between">
                                                <span>{p.name} - {p.dosage} x {p.frequency} (Qty: {p.quantity})</span>
                                                <button type="button" onClick={()=>removeOrder('prescriptions', i)} className="text-red-500">x</button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Surgery */}
                                    <div className="border p-3 rounded col-span-2 bg-red-50">
                                        <h3 className="font-bold mb-2 text-red-800">Book Surgery</h3>
                                        <div className="flex gap-2">
                                            <div className="w-1/2">
                                                <ReactSelect options={surgeryOptions} onChange={opt => setData('surgery_request', { ...data.surgery_request, procedure_id: opt.value })} />
                                            </div>
                                            <TextInput type="datetime-local" className="w-1/3" onChange={e => setData('surgery_request', { ...data.surgery_request, date: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <PrimaryButton disabled={processing}>Save Consultation</PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </HospitalLayout>
    );
}