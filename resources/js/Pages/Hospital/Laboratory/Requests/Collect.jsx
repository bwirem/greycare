import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton'; // Assuming you have this
import DangerButton from '@/Components/DangerButton'; // Assuming you have this
import Modal from '@/Components/Modal'; // Assuming you have this

export default function CollectSample({ request, patient, panel, sample_types, rejection_reasons }) {
    
    // --- State for Modal Visibility ---
    const [showRejectModal, setShowRejectModal] = useState(false);

    // --- Form 1: Collection Logic ---
    const { data, setData, post, processing, errors } = useForm({
        lab_nature_of_sample_id: panel.lab_nature_of_sample_id || '', 
        collection_date: new Date().toISOString().slice(0, 16),
        notes: ''
    });

    const submitCollection = (e) => {
        e.preventDefault();
        post(route('laboratory0.store', request.id));
    };

    // --- Form 2: Rejection Logic ---
    // We rename the destructured helpers to avoid conflict with the first form
    const { 
        data: rejectData, 
        setData: setRejectData, 
        post: postReject, 
        processing: rejectProcessing, 
        errors: rejectErrors,
        reset: resetReject
    } = useForm({
        reason_id: ''
    });

    const submitRejection = (e) => {
        e.preventDefault();
        postReject(route('laboratory0.reject', request.id), {
            onSuccess: () => setShowRejectModal(false),
            onFinish: () => resetReject()
        });
    };

    return (
        <HospitalLayout header={<h2>Sample Collection</h2>}>
            <Head title="Collect Sample" />

            <div className="py-8 max-w-2xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow rounded-lg">
                    
                    {/* Header Info */}
                    <div className="mb-6 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="font-bold text-lg">{patient.first_name} {patient.last_name}</h3>
                                <p className="text-sm text-gray-600">ID: {patient.code} | Age: {patient.age}y</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs uppercase text-gray-500">Test Requested</span>
                                <span className="font-bold text-indigo-700 text-xl">{panel.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Collection Form */}
                    <form onSubmit={submitCollection} className="space-y-4">
                        
                        <div>
                            <InputLabel value="Nature of Sample" />
                            <select 
                                className="w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500"
                                value={data.lab_nature_of_sample_id}
                                onChange={e => setData('lab_nature_of_sample_id', e.target.value)}
                                required
                            >
                                <option value="">Select Sample Type...</option>
                                {sample_types.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {errors.lab_nature_of_sample_id && <p className="text-red-500 text-xs mt-1">{errors.lab_nature_of_sample_id}</p>}
                        </div>

                        <div>
                            <InputLabel value="Collection Date/Time" />
                            <TextInput 
                                type="datetime-local" 
                                className="w-full"
                                value={data.collection_date}
                                onChange={e => setData('collection_date', e.target.value)}
                                required
                            />
                            {errors.collection_date && <p className="text-red-500 text-xs mt-1">{errors.collection_date}</p>}
                        </div>

                        <div>
                            <InputLabel value="Lab Notes / Comments" />
                            <textarea 
                                className="w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500"
                                rows="3"
                                placeholder="e.g. Hemolyzed sample warning..."
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex justify-between pt-4 border-t items-center">
                            {/* Rejection Trigger Button */}
                            <button 
                                type="button" 
                                onClick={() => setShowRejectModal(true)}
                                className="text-red-600 text-sm underline hover:text-red-800 font-semibold"
                            >
                                Reject Request
                            </button>
                            
                            <PrimaryButton disabled={processing}>
                                Confirm Collection
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- REJECTION MODAL --- */}
            <Modal show={showRejectModal} onClose={() => setShowRejectModal(false)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Reject Lab Request
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Please select a reason for rejecting this test request. This action cannot be undone.
                    </p>

                    <form onSubmit={submitRejection} className="mt-6">
                        <div className="mb-4">
                            <InputLabel value="Reason for Rejection" />
                            <select 
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                value={rejectData.reason_id}
                                onChange={e => setRejectData('reason_id', e.target.value)}
                                required
                            >
                                <option value="">Select a reason...</option>
                                {rejection_reasons.map(reason => (
                                    <option key={reason.id} value={reason.id}>
                                        {reason.name}
                                    </option>
                                ))}
                            </select>
                            {rejectErrors.reason_id && <p className="text-red-500 text-xs mt-1">{rejectErrors.reason_id}</p>}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setShowRejectModal(false)}>
                                Cancel
                            </SecondaryButton>

                            <DangerButton disabled={rejectProcessing} className="ml-3">
                                {rejectProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                            </DangerButton>
                        </div>
                    </form>
                </div>
            </Modal>

        </HospitalLayout>
    );
}