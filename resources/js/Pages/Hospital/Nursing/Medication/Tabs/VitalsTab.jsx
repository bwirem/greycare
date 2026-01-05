import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react'; // Local form handling for this tab
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat, faClock, faUserNurse, faHistory, faSave } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function VitalsTab({ history = [], source_id, source_type, patient_code }) {

    // Local form state for Vitals
    const { data, setData, post, processing, reset } = useForm({
        source_id: source_id,
        source_type: source_type,
        patient_code: patient_code,
        bp: '',
        pulse: '',
        temperature: '',
        spo2: '',
        resp_rate: '',
        weight: '',
        height: '',
        bmi: ''
    });

    // Auto-Calculate BMI
    useEffect(() => {
        const h = parseFloat(data.height) || 0; // cm
        const w = parseFloat(data.weight) || 0; // kg

        if (h > 0 && w > 0) {
            const heightInMeters = h / 100;
            const bmi = w / (heightInMeters * heightInMeters);
            setData('bmi', bmi.toFixed(2));
        }
    }, [data.height, data.weight]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.bp && !data.temperature && !data.pulse) {
            toast.error("Please enter at least one vital sign.");
            return;
        }

        post(route('nursing1.store_vitals'), {
            onSuccess: () => {
                toast.success("Vitals Recorded");
                reset('bp', 'pulse', 'temperature', 'spo2', 'resp_rate', 'weight', 'height', 'bmi');
            },
            preserveScroll: true
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            
            {/* --- 1. NEW READING FORM --- */}
            <form onSubmit={handleSubmit} className="bg-red-50 border border-red-100 p-5 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-red-200 pb-2">
                    <h4 className="font-bold text-red-800 flex items-center gap-2">
                        <FontAwesomeIcon icon={faHeartbeat} /> Record New Vitals
                    </h4>
                    <PrimaryButton disabled={processing} className="bg-red-600 hover:bg-red-700 h-8 text-xs">
                        <FontAwesomeIcon icon={faSave} className="mr-2"/> Save Vitals
                    </PrimaryButton>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <InputLabel value="BP (mmHg)" />
                        <TextInput 
                            placeholder="120/80" 
                            className="w-full mt-1 border-red-200 focus:ring-red-500" 
                            value={data.bp}
                            onChange={e => setData('bp', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel value="Pulse (bpm)" />
                        <TextInput 
                            type="number" 
                            className="w-full mt-1 border-red-200 focus:ring-red-500" 
                            value={data.pulse}
                            onChange={e => setData('pulse', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel value="Temp (°C)" />
                        <TextInput 
                            type="number" step="0.1" 
                            className="w-full mt-1 border-red-200 focus:ring-red-500" 
                            value={data.temperature}
                            onChange={e => setData('temperature', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel value="SpO2 (%)" />
                        <TextInput 
                            type="number" 
                            className="w-full mt-1 border-red-200 focus:ring-red-500" 
                            value={data.spo2}
                            onChange={e => setData('spo2', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel value="Resp Rate" />
                        <TextInput 
                            type="number" 
                            className="w-full mt-1 border-red-200 focus:ring-red-500" 
                            value={data.resp_rate}
                            onChange={e => setData('resp_rate', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel value="Weight (kg)" />
                        <TextInput 
                            type="number" step="0.1" 
                            className="w-full mt-1 border-red-200 focus:ring-red-500" 
                            value={data.weight}
                            onChange={e => setData('weight', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel value="Height (cm)" />
                        <TextInput 
                            type="number" 
                            className="w-full mt-1 border-red-200 focus:ring-red-500" 
                            value={data.height}
                            onChange={e => setData('height', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel value="BMI" />
                        <TextInput 
                            readOnly
                            className="w-full mt-1 bg-gray-100 text-gray-600 cursor-not-allowed" 
                            value={data.bmi}
                        />
                    </div>
                </div>
            </form>

            {/* --- 2. VITALS HISTORY TABLE --- */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        <FontAwesomeIcon icon={faHistory} /> Vitals History
                    </h4>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                        {history.length} Entries
                    </span>
                </div>

                <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Date/Time</th>
                                <th className="px-4 py-3">BP</th>
                                <th className="px-4 py-3">Pulse</th>
                                <th className="px-4 py-3">Temp</th>
                                <th className="px-4 py-3">SpO2</th>
                                <th className="px-4 py-3">RR</th>
                                <th className="px-4 py-3">Recorded By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {history.length > 0 ? history.map((rec) => (
                                <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 font-medium">
                                        <FontAwesomeIcon icon={faClock} className="text-gray-300 mr-2" />
                                        {formatTime(rec.vitaldatetime || rec.created_at)}
                                    </td>
                                    <td className="px-4 py-3">{rec.blood_pressure || '-'}</td>
                                    <td className="px-4 py-3">{rec.pulse || '-'}</td>
                                    <td className={`px-4 py-3 font-bold ${rec.temperature > 37.5 ? 'text-red-600' : 'text-gray-700'}`}>
                                        {rec.temperature}°C
                                    </td>
                                    <td className={`px-4 py-3 font-bold ${rec.oxygensaturation < 95 ? 'text-red-600' : 'text-blue-600'}`}>
                                        {rec.oxygensaturation}%
                                    </td>
                                    <td className="px-4 py-3">{rec.respirationrate || '-'}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <FontAwesomeIcon icon={faUserNurse} /> 
                                            {rec.user?.name || 'Unknown'}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400 italic">
                                        No vitals recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}