import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel'; // Assuming you have this

export default function PostOpCare({ booking }) {
    // 1. Initialize all state variables
    const { data, setData, post, processing } = useForm({
        bp: '', 
        spo2: '', 
        heart_rate: '',
        resp_rate: '',    // Added
        temperature: '',  // Added
        consciousness_level: 'Alert', // Added with default
        iv_fluids: '', 
        analgesia: '',
        discharge_to: ''
    });

    const submitVitals = (e) => {
        e.preventDefault();
        post(route('theatre3.store', booking.id));
    };

    const discharge = () => {
        if(data.discharge_to && confirm('Discharge patient from recovery?')) {
            post(route('theatre3.discharge', booking.id));
        } else {
            alert('Please specify where the patient is going (Discharge To).');
        }
    };

    return (
        <HospitalLayout header={<h2>Post-Operative Care</h2>}>
            <Head title="Recovery Room" />

            <div className="py-8 max-w-5xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Vitals Form */}
                <form onSubmit={submitVitals} className="bg-white p-6 shadow rounded-lg border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-indigo-700">Monitor Vitals</h3>
                    
                    {/* Row 1 */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <InputLabel value="BP (mmHg)" />
                            <TextInput value={data.bp} onChange={e => setData('bp', e.target.value)} className="w-full" />
                        </div>
                        <div>
                            <InputLabel value="HR (bpm)" />
                            <TextInput type="number" value={data.heart_rate} onChange={e => setData('heart_rate', e.target.value)} className="w-full" />
                        </div>
                        <div>
                            <InputLabel value="SpO2 (%)" />
                            <TextInput type="number" value={data.spo2} onChange={e => setData('spo2', e.target.value)} className="w-full" />
                        </div>
                    </div>

                    {/* Row 2 - Added Missing Fields */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <InputLabel value="Resp. Rate" />
                            <TextInput type="number" value={data.resp_rate} onChange={e => setData('resp_rate', e.target.value)} className="w-full" />
                        </div>
                        <div>
                            <InputLabel value="Temp (°C)" />
                            <TextInput type="number" step="0.1" value={data.temperature} onChange={e => setData('temperature', e.target.value)} className="w-full" />
                        </div>
                        <div>
                            <InputLabel value="Consciousness" />
                            <select 
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500"
                                value={data.consciousness_level}
                                onChange={e => setData('consciousness_level', e.target.value)}
                            >
                                <option value="Alert">Alert</option>
                                <option value="Drowsy">Drowsy</option>
                                <option value="Unconscious">Unconscious</option>
                            </select>
                        </div>
                    </div>

                    <h3 className="font-bold text-lg mb-4 mt-6 text-indigo-700">Medications / Fluids</h3>
                    <div className="space-y-4 mb-6">
                        <div>
                            <InputLabel value="IV Fluids" />
                            <TextInput placeholder="e.g. 500ml NS" className="w-full" value={data.iv_fluids} onChange={e => setData('iv_fluids', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="Analgesia / Meds Given" />
                            <TextInput placeholder="e.g. Paracetamol 1g IV" className="w-full" value={data.analgesia} onChange={e => setData('analgesia', e.target.value)} />
                        </div>
                    </div>

                    <PrimaryButton disabled={processing} className="w-full justify-center">
                        Record Vitals & Treatment
                    </PrimaryButton>
                </form>

                {/* Discharge Panel */}
                <div className="bg-green-50 p-6 shadow rounded-lg border border-green-200 h-fit">
                    <h3 className="font-bold text-lg mb-4 text-green-800">Discharge from Recovery</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Transfer To:</label>
                        <select 
                            className="w-full border-gray-300 rounded mt-1"
                            value={data.discharge_to}
                            onChange={e => setData('discharge_to', e.target.value)}
                        >
                            <option value="">Select Location...</option>
                            <option>General Ward</option>
                            <option>ICU</option>
                            <option>Home</option>
                        </select>
                    </div>
                    <button 
                        onClick={discharge}
                        className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 font-bold transition shadow"
                    >
                        Discharge Patient
                    </button>
                </div>

            </div>
        </HospitalLayout>
    );
}