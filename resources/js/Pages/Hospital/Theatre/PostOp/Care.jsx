import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHistory, faClock, faHeartbeat, 
    faProcedures, faSyringe, faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

export default function PostOpCare({ booking, wards = [] }) {
    
    // --- Form State ---
    const { data, setData, post, processing, reset, errors } = useForm({
        // Vitals
        bp: '', 
        spo2: '', 
        heart_rate: '',
        resp_rate: '', 
        temperature: '', 
        consciousness_level: 'Alert',
        // Meds
        iv_fluids: '', 
        analgesia: '', 
        // Discharge
        discharge_to: ''
    });

    // --- Submit Vitals ---
    const submitVitals = (e) => {
        e.preventDefault();
        post(route('theatre3.store', booking.id), {
            onSuccess: () => {
                // Reset vital fields but keep discharge selection
                reset('bp', 'spo2', 'heart_rate', 'resp_rate', 'temperature', 'iv_fluids', 'analgesia');
            },
            preserveScroll: true
        });
    };

    // --- Handle Discharge ---
    const discharge = () => {
        if(!data.discharge_to) {
            alert('Please specify where the patient is going (Transfer To).');
            return;
        }

        if(confirm(`Are you sure you want to discharge/transfer this patient to: ${data.discharge_to}?`)) {
            post(route('theatre3.discharge', booking.id));
        }
    };

    // --- Helper: Format Time ---
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <HospitalLayout header={
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Post-Operative Recovery</h2>
                <span className="text-sm text-gray-500 font-mono">{booking.patientcode}</span>
            </div>
        }>
            <Head title="Recovery Room Care" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
                
                {/* Patient Header Info */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r shadow-sm">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-blue-900">
                                {booking.patient?.first_name} {booking.patient?.last_name}
                            </h3>
                            <p className="text-sm text-blue-700">
                                Procedure: <strong>{booking.procedure?.name}</strong>
                            </p>
                        </div>
                        <div className="text-right text-sm text-blue-600">
                            <p>Surgeon: {booking.doctor?.name || 'N/A'}</p>
                            <p>Theatre: {booking.theatre?.name || 'Main OT'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* ================= LEFT COLUMN: FORMS ================= */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* --- 1. VITALS MONITORING FORM --- */}
                        <form onSubmit={submitVitals} className="bg-white p-6 shadow rounded-lg border border-gray-200">
                            <h3 className="font-bold text-lg mb-4 text-indigo-700 flex items-center gap-2 border-b pb-2">
                                <FontAwesomeIcon icon={faHeartbeat} /> Monitor Vitals
                            </h3>
                            
                            {/* Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <InputLabel value="BP (mmHg) *" />
                                    <TextInput 
                                        value={data.bp} 
                                        onChange={e => setData('bp', e.target.value)} 
                                        className="w-full" 
                                        placeholder="e.g. 120/80"
                                        required
                                    />
                                    {errors.bp && <p className="text-red-500 text-xs">{errors.bp}</p>}
                                </div>
                                <div>
                                    <InputLabel value="HR (bpm) *" />
                                    <TextInput 
                                        type="number" 
                                        value={data.heart_rate} 
                                        onChange={e => setData('heart_rate', e.target.value)} 
                                        className="w-full" 
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel value="SpO2 (%) *" />
                                    <TextInput 
                                        type="number" 
                                        value={data.spo2} 
                                        onChange={e => setData('spo2', e.target.value)} 
                                        className="w-full" 
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <InputLabel value="Resp. Rate" />
                                    <TextInput 
                                        type="number" 
                                        value={data.resp_rate} 
                                        onChange={e => setData('resp_rate', e.target.value)} 
                                        className="w-full" 
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Temp (°C)" />
                                    <TextInput 
                                        type="number" step="0.1" 
                                        value={data.temperature} 
                                        onChange={e => setData('temperature', e.target.value)} 
                                        className="w-full" 
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Consciousness" />
                                    <select 
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        value={data.consciousness_level}
                                        onChange={e => setData('consciousness_level', e.target.value)}
                                    >
                                        <option value="Alert">Alert</option>
                                        <option value="Drowsy">Drowsy</option>
                                        <option value="Unconscious">Unconscious</option>
                                    </select>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg mb-4 mt-8 text-indigo-700 flex items-center gap-2 border-b pb-2">
                                <FontAwesomeIcon icon={faSyringe} /> Interventions / Fluids
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <InputLabel value="IV Fluids Given" />
                                    <TextInput 
                                        placeholder="e.g. 500ml NS" 
                                        className="w-full" 
                                        value={data.iv_fluids} 
                                        onChange={e => setData('iv_fluids', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Analgesia / Meds Given" />
                                    <TextInput 
                                        placeholder="e.g. Paracetamol 1g IV" 
                                        className="w-full" 
                                        value={data.analgesia} 
                                        onChange={e => setData('analgesia', e.target.value)} 
                                    />
                                </div>
                            </div>

                            <PrimaryButton disabled={processing} className="w-full justify-center py-3 text-base">
                                {processing ? 'Saving...' : 'Record Log'}
                            </PrimaryButton>
                        </form>

                        {/* --- 2. DISCHARGE / TRANSFER PANEL --- */}
                        <div className="bg-green-50 p-6 shadow rounded-lg border border-green-200">
                            <h3 className="font-bold text-lg mb-4 text-green-800 flex items-center gap-2">
                                <FontAwesomeIcon icon={faSignOutAlt} /> Discharge / Transfer
                            </h3>
                            <div className="mb-4">
                                <InputLabel value="Transfer To / Destination" className="mb-1" />
                                
                                <select 
                                    className="w-full border-gray-300 rounded shadow-sm focus:border-green-500 focus:ring-green-500" 
                                    value={data.discharge_to} 
                                    onChange={e => setData('discharge_to', e.target.value)}
                                >
                                    <option value="">-- Select Destination --</option>
                                    
                                    {/* Static Options */}
                                    <option value="Home">Home (Discharge)</option>
                                    <option value="Mortuary">Mortuary</option>
                                    <option disabled>────────────────</option>
                                    
                                    {/* Dynamic Wards from DB */}
                                    <optgroup label="Hospital Wards">
                                        {wards.length > 0 ? (
                                            wards.map((ward) => (
                                                <option key={ward.id} value={ward.id}>
                                                    {ward.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No Wards Available</option>
                                        )}
                                    </optgroup>
                                </select>
                                {errors.discharge_to && <p className="text-red-600 text-xs mt-1">{errors.discharge_to}</p>}
                            </div>
                            <button 
                                onClick={discharge} 
                                className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 font-bold transition shadow"
                            >
                                Confirm Transfer & Complete Recovery
                            </button>
                        </div>
                    </div>

                    {/* ================= RIGHT COLUMN: HISTORY ================= */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden sticky top-6">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faHistory} className="text-gray-400"/> Vitals History
                                </h3>
                                <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500">
                                    {booking.post_op_arrivals ? booking.post_op_arrivals.length : 0} Logs
                                </span>
                            </div>
                            
                            <div className="max-h-[600px] overflow-y-auto">
                                {booking.post_op_arrivals && booking.post_op_arrivals.length > 0 ? (
                                    <table className="min-w-full text-xs text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                                            <tr>
                                                <th className="px-3 py-2">Time</th>
                                                <th className="px-3 py-2">BP</th>
                                                <th className="px-3 py-2">HR</th>
                                                <th className="px-3 py-2">SpO2</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {booking.post_op_arrivals.map((vital, idx) => (
                                                <tr key={vital.id} className={`hover:bg-gray-50 transition ${idx === 0 ? "bg-blue-50" : ""}`}>
                                                    <td className="px-3 py-2 font-medium text-gray-600 flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faClock} className="text-[10px] text-gray-400"/>
                                                        {formatTime(vital.created_at)}
                                                    </td>
                                                    <td className="px-3 py-2 font-mono">{vital.bp}</td>
                                                    <td className="px-3 py-2 font-mono">{vital.heart_rate}</td>
                                                    <td className={`px-3 py-2 font-bold font-mono ${vital.spo2 < 95 ? 'text-red-600' : 'text-blue-600'}`}>
                                                        {vital.spo2}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-sm italic border-t border-gray-100">
                                        <FontAwesomeIcon icon={faProcedures} className="text-3xl mb-2 opacity-20" />
                                        <p>No vitals recorded yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </HospitalLayout>
    );
}