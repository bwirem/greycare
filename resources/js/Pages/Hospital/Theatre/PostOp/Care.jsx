import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function PostOpCare({ booking }) {
    const { data, setData, post, processing } = useForm({
        bp: '', spo2: '', heart_rate: '',
        iv_fluids: '', analgesia: '',
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

            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8 grid grid-cols-2 gap-6">
                
                {/* Vitals Form */}
                <form onSubmit={submitVitals} className="bg-white p-6 shadow rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Monitor Vitals & Meds</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <TextInput placeholder="BP" value={data.bp} onChange={e => setData('bp', e.target.value)} />
                        <TextInput placeholder="SpO2" value={data.spo2} onChange={e => setData('spo2', e.target.value)} />
                        <TextInput placeholder="HR" value={data.heart_rate} onChange={e => setData('heart_rate', e.target.value)} />
                    </div>
                    <div className="mb-4">
                        <TextInput placeholder="Analgesia Given" className="w-full" value={data.analgesia} onChange={e => setData('analgesia', e.target.value)} />
                    </div>
                    <PrimaryButton>Log Vitals</PrimaryButton>
                </form>

                {/* Discharge Panel */}
                <div className="bg-green-50 p-6 shadow rounded-lg border border-green-200">
                    <h3 className="font-bold text-lg mb-4 text-green-800">Discharge from Recovery</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700">Transfer To:</label>
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
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold"
                    >
                        Discharge Patient
                    </button>
                </div>

            </div>
        </HospitalLayout>
    );
}