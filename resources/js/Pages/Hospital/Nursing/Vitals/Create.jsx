import React, { useEffect } from 'react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faSave, faTimes, faHeartbeat, faWeight, faLungs, faTint
} from "@fortawesome/free-solid-svg-icons";

// Accept existingVitals prop
export default function NursingCreate({ auth, booking, existingVitals }) {
    
    // Parse BP string if exists (e.g., "120/80")
    let initialSys = '';
    let initialDia = '';
    
    if (existingVitals && existingVitals.blood_pressure) {
        const bpParts = existingVitals.blood_pressure.split('/');
        if (bpParts.length === 2) {
            initialSys = bpParts[0];
            initialDia = bpParts[1];
        }
    }

    const { data, setData, post, processing, errors } = useForm({
        weight: existingVitals?.weight || '',
        height: existingVitals?.height || '',
        bmi: existingVitals?.bmi || '',
        temperature: existingVitals?.temperature || '',
        pulse: existingVitals?.pulse || '',
        respirationrate: existingVitals?.respirationrate || '',
        systolic: initialSys,
        diastolic: initialDia,
        oxygensaturation: existingVitals?.oxygensaturation || '',
        muac: existingVitals?.muac || '',
    });

    // Auto-Calculate BMI
    useEffect(() => {
        if (data.weight && data.height) {
            const heightInMeters = data.height / 100;
            const bmiValue = (data.weight / (heightInMeters * heightInMeters)).toFixed(2);
            // Only update BMI if calculated value is valid and different
            if (bmiValue !== "NaN" && bmiValue !== "Infinity") {
                 setData('bmi', bmiValue);
            }
        }
    }, [data.weight, data.height]);

    const submit = (e) => {
        e.preventDefault();
        post(route('nursing0.store', booking.id));
    };

    return (
        <HospitalLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    <FontAwesomeIcon icon={faHeartbeat} className="mr-2 text-pink-500" />
                    {existingVitals ? 'Edit Vitals' : 'Record Vitals'}
                </h2>
            }
        >
            <Head title="Record Vitals" />

            <div className="max-w-5xl mx-auto py-2">
                
                <div className="bg-white shadow rounded-lg mb-6 p-4 flex justify-between items-center border-l-4 border-blue-500">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{booking.patient_name}</h3>
                        <p className="text-sm text-gray-500">
                            {booking.file_number} | {booking.gender}, {booking.age} Yrs
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs text-gray-400 uppercase">Visit No</span>
                        <span className="text-lg font-mono font-bold text-blue-600">{booking.visit_number}</span>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="bg-white shadow rounded-lg p-6">
                        {existingVitals && (
                            <div className="mb-4 p-2 bg-yellow-50 text-yellow-700 text-sm rounded border border-yellow-200">
                                <strong>Note:</strong> You are editing previously recorded vitals.
                            </div>
                        )}

                        {/* ... The rest of the form fields remain exactly the same as your original code ... */}
                        
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-4 border-b pb-2">Anthropometry</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* Weight */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faWeight} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="number" step="0.1"
                                        value={data.weight}
                                        onChange={e => setData('weight', e.target.value)}
                                        className="pl-10 block w-full rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                        autoFocus
                                    />
                                </div>
                                {errors.weight && <div className="text-red-500 text-xs">{errors.weight}</div>}
                            </div>

                            {/* Height */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                                <input
                                    type="number" step="0.1"
                                    value={data.height}
                                    onChange={e => setData('height', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                />
                            </div>

                            {/* BMI */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">BMI</label>
                                <input
                                    type="text"
                                    value={data.bmi}
                                    readOnly
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 sm:text-sm"
                                />
                            </div>
                        </div>

                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-4 border-b pb-2">Vital Signs</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* Temperature */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
                                <input
                                    type="number" step="0.1"
                                    value={data.temperature}
                                    onChange={e => setData('temperature', e.target.value)}
                                    className={`mt-1 block w-full rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500 sm:text-sm ${data.temperature > 37.5 ? 'text-red-600 font-bold' : ''}`}
                                />
                            </div>

                            {/* Blood Pressure */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Blood Pressure (mmHg)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Sys"
                                        value={data.systolic}
                                        onChange={e => setData('systolic', e.target.value)}
                                        className="mt-1 block w-1/2 rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    />
                                    <span className="self-center text-gray-400">/</span>
                                    <input
                                        type="number"
                                        placeholder="Dia"
                                        value={data.diastolic}
                                        onChange={e => setData('diastolic', e.target.value)}
                                        className="mt-1 block w-1/2 rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Pulse */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pulse (bpm)</label>
                                <input
                                    type="number"
                                    value={data.pulse}
                                    onChange={e => setData('pulse', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                />
                            </div>

                            {/* SPO2 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">SPO2 (%)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faTint} className="text-blue-400" />
                                    </div>
                                    <input
                                        type="number"
                                        value={data.oxygensaturation}
                                        onChange={e => setData('oxygensaturation', e.target.value)}
                                        className="pl-10 block w-full rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Respiration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Resp. Rate (bpm)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faLungs} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        value={data.respirationrate}
                                        onChange={e => setData('respirationrate', e.target.value)}
                                        className="pl-10 block w-full rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* MUAC */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">MUAC (cm)</label>
                                <input
                                    type="number" step="0.1"
                                    value={data.muac}
                                    onChange={e => setData('muac', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Link
                                href={route('nursing0.index')}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none transition"
                            >
                                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cancel
                            </Link>
                            
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-pink-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest shadow-sm hover:bg-pink-700 focus:outline-none transition"
                            >
                                <FontAwesomeIcon icon={faSave} className="mr-2" /> 
                                {processing ? 'Saving...' : (existingVitals ? 'Update Vitals' : 'Save & Send to Doctor')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </HospitalLayout>
    );
}