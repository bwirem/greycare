import React, { useState, useEffect } from 'react'; // <--- FIXED HERE
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';

export default function EnterResults({ sample, patient, panel, parameters, existing_results, rejection_reasons }) {
    
    // --- State for Modal Visibility ---
    const [showRejectModal, setShowRejectModal] = useState(false);

    // --- Form 1: Results Entry ---
    const { data, setData, post, processing } = useForm({
        is_final: false,
        results: parameters.map(param => ({
            parameter_id: param.id,
            result_value: existing_results[param.id]?.result_value || '',
            remarks: existing_results[param.id]?.remarks || ''
        }))
    });

    const handleResultChange = (index, value) => {
        const newResults = [...data.results];
        newResults[index].result_value = value;
        setData('results', newResults);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('laboratory1.store', sample.id));
    };

    // --- Form 2: Rejection Logic ---
    const { 
        data: rejectData, 
        setData: setRejectData, 
        post: postReject, 
        processing: rejectProcessing, 
        reset: resetReject
    } = useForm({
        reason_id: ''
    });

    const handleReject = (e) => {
        e.preventDefault();
        postReject(route('laboratory1.reject_sample', sample.id), {
            onSuccess: () => setShowRejectModal(false),
            onFinish: () => resetReject()
        });
    };

    return (
        <HospitalLayout header={<h2>Enter Results: {panel.name}</h2>}>
            <Head title="Enter Results" />

            <div className="py-8 max-w-5xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow rounded-lg">
                    
                    {/* Patient Banner */}
                    <div className="flex justify-between border-b pb-4 mb-6">
                        <div>
                            <span className="text-gray-500 text-xs uppercase">Patient</span>
                            <div className="font-bold text-lg">{patient.first_name} {patient.last_name}</div>
                        </div>
                        <div className="text-right">
                            <span className="text-gray-500 text-xs uppercase">Sample Code</span>
                            <div className="font-mono font-bold text-lg">{sample.sample_code}</div>
                        </div>
                    </div>

                    <form onSubmit={submit}>
                        {/* Results Grid */}
                        <table className="min-w-full divide-y divide-gray-200 mb-6">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Parameter</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Result Value</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Units</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Reference Range</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {parameters.map((param, index) => (
                                    <tr key={param.id}>
                                        <td className="px-4 py-4 font-medium text-gray-900">{param.name}</td>
                                        
                                        {/* DYNAMIC INPUT BASED ON RESULT TYPE */}
                                        <td className="px-4 py-4">
                                            {param.result_type === 1 ? ( // Numeric
                                                <TextInput 
                                                    type="number" 
                                                    step="any"
                                                    className="w-full"
                                                    value={data.results[index].result_value}
                                                    onChange={e => handleResultChange(index, e.target.value)}
                                                />
                                            ) : param.result_type === 3 ? ( // Dropdown
                                                <select 
                                                    className="w-full border-gray-300 rounded shadow-sm"
                                                    value={data.results[index].result_value}
                                                    onChange={e => handleResultChange(index, e.target.value)}
                                                >
                                                    <option value="">Select...</option>
                                                    {param.dropdowns.map(opt => (
                                                        <option key={opt.id} value={opt.value}>{opt.value}</option>
                                                    ))}
                                                </select>
                                            ) : ( // Text
                                                <TextInput 
                                                    className="w-full"
                                                    value={data.results[index].result_value}
                                                    onChange={e => handleResultChange(index, e.target.value)}
                                                />
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-gray-500">{param.units}</td>
                                        <td className="px-4 py-4 text-xs text-gray-400">
                                            {/* Display ranges dynamically if needed */}
                                            {param.ranges.length > 0 ? (
                                                <>
                                                    M: {param.ranges[0].male_min}-{param.ranges[0].male_max}<br/>
                                                    F: {param.ranges[0].female_min}-{param.ranges[0].female_max}
                                                </>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between border-t pt-4">
                            {/* Reject Button */}
                            <button 
                                type="button" 
                                onClick={() => setShowRejectModal(true)} 
                                className="text-red-600 underline text-sm font-bold hover:text-red-800"
                            >
                                Reject Sample / Bad Specimen
                            </button>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        checked={data.is_final}
                                        onChange={e => setData('is_final', e.target.checked)}
                                    />
                                    <span className="text-sm font-medium text-gray-700">Mark as Final / Completed</span>
                                </label>
                                <PrimaryButton disabled={processing}>Save Results</PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- REJECTION MODAL --- */}
            <Modal show={showRejectModal} onClose={() => setShowRejectModal(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Reject Specimen</h2>
                    <p className="mt-1 text-sm text-gray-600 mb-4">
                        Mark this sample as unusable (e.g., Hemolyzed, Clotted). The doctor will be notified to redraw.
                    </p>
                    
                    <div className="mb-4">
                        <select 
                            className="w-full border-gray-300 rounded shadow-sm"
                            value={rejectData.reason_id}
                            onChange={e => setRejectData('reason_id', e.target.value)}
                        >
                            <option value="">Select Reason...</option>
                            {rejection_reasons?.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowRejectModal(false)}>Cancel</SecondaryButton>
                        <DangerButton onClick={handleReject} disabled={rejectProcessing}>Confirm Rejection</DangerButton>
                    </div>
                </div>
            </Modal>

        </HospitalLayout>
    );
}