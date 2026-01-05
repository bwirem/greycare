import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyringe, faFileMedicalAlt } from '@fortawesome/free-solid-svg-icons';

// --- Import the Combined Tab ---
import MedicationListTab from './Tabs/MedicationListTab';
import RoundHistoryTab from './Tabs/RoundHistoryTab';

export default function MedicationCreate({ 
    patient, 
    prescriptions, 
    source_id, 
    source_type,
    pharmacy_frequencies = [],
    pharmacy_durations = [],
    previous_rounds = [],
    opd_consultation = null,
    diagnosis_history = []
}) {
    
    // --- State ---
    const [activeTab, setActiveTab] = useState('medication'); 
    const [selectedRx, setSelectedRx] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // --- Form State ---
    const { data, setData, post, processing, reset, errors } = useForm({
        prescription_id: '',
        status: 'Given',
        quantity: 1, 
        remarks: '',
        source_id: source_id,
        source_type: source_type,
    });

    // --- Modal Logic ---
    const openAdminModal = (rx) => {
        setSelectedRx(rx);

        const inputDosage = parseFloat(rx.dosage) || 0;
        let finalQty = 0;

        if (inputDosage > 0) {
            const details = rx.product?.drug_details; 
            if (details) {
                const type = parseInt(details.formulation_type); 
                const strength = parseFloat(details.strength_amount) || 0;
                const bottleSize = parseFloat(details.total_volume) || 0;

                if (type === 0 && strength > 0 && inputDosage >= strength) {
                    finalQty = (inputDosage / strength); 
                } else if (type === 1 && bottleSize > 0) {
                    finalQty = inputDosage; 
                } else {
                    finalQty = inputDosage;
                }
            } else {
                finalQty = inputDosage; 
            }
        }

        const defaultQty = finalQty > 0 ? Math.ceil(finalQty) : 1;
        
        setData(prev => ({ 
            ...prev, 
            prescription_id: rx.id, 
            status: 'Given', 
            quantity: defaultQty, 
            remarks: '' 
        }));
        
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('nursing1.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    return (
        <HospitalLayout header={<h2>Medication Administration Record (MAR)</h2>}>
            <Head title="Administer Meds" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
                
                {/* --- LEFT: Patient Sidebar --- */}
                <div className="w-full md:w-1/4 bg-white p-5 rounded-lg shadow-sm border border-gray-200 h-fit">
                    <div className="text-center mb-4">
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-blue-700 border-2 border-white shadow">
                            {patient.first_name[0]}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{patient.first_name} {patient.last_name}</h3>
                        <p className="text-sm text-gray-500 font-mono bg-gray-100 rounded px-2 py-1 mt-1 inline-block">{patient.code}</p>
                    </div>
                    <div className="border-t pt-3 text-sm text-gray-600 space-y-2">
                        <div className="flex justify-between"><span>Age/Sex:</span> <span className="font-medium text-gray-900">{patient.age} / {patient.gender}</span></div>
                        <div className="flex justify-between"><span>Weight:</span> <span className="font-medium text-gray-900">-- kg</span></div>
                        <div className="flex justify-between"><span>Allergies:</span> <span className="font-medium text-red-500">NKA</span></div>
                    </div>
                </div>

                {/* --- RIGHT: Main Content --- */}
                <div className="w-full md:w-3/4 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-[600px]">
                    
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg overflow-x-auto">
                        <button 
                            onClick={() => setActiveTab('medication')}
                            className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
                                activeTab === 'medication' 
                                ? 'bg-white text-indigo-600 border-t-2 border-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <FontAwesomeIcon icon={faSyringe} /> Medications
                        </button>
                        
                        <button 
                            onClick={() => setActiveTab('clinical_history')}
                            className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
                                activeTab === 'clinical_history' 
                                ? 'bg-white text-indigo-600 border-t-2 border-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <FontAwesomeIcon icon={faFileMedicalAlt} /> Clinical History
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 flex-1 bg-white">
                        
                        {/* Tab 1: Medications + History Combined */}
                        {activeTab === 'medication' && (
                            <MedicationListTab 
                                prescriptions={prescriptions} 
                                onAdminister={openAdminModal} 
                            />
                        )}

                        {/* Tab 2: Ward/Clinical History */}
                        {activeTab === 'clinical_history' && (
                            <RoundHistoryTab 
                                history={previous_rounds} 
                                opdData={opd_consultation} 
                                diagnosisHistory={diagnosis_history}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* --- ADMINISTER MODAL --- */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                        Administer Medication
                    </h3>
                    
                    <div className="mb-4 bg-indigo-50 p-3 rounded text-sm border border-indigo-100">
                        <p className="font-bold text-indigo-900">{selectedRx?.product?.name}</p>
                        <p className="text-indigo-700 mt-1">
                            Prescribed: <strong>{selectedRx?.dosage}</strong> <span className="text-gray-400">|</span> Freq: {selectedRx?.frequency}
                        </p>
                    </div>

                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Action / Status</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Given', 'Missed', 'Refused', 'Held'].map(opt => (
                                    <button 
                                        key={opt}
                                        type="button"
                                        onClick={() => setData('status', opt)}
                                        className={`py-2 px-3 rounded text-sm font-bold border transition ${
                                            data.status === opt 
                                            ? 'bg-indigo-600 text-white border-indigo-600' 
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Quantity Administered (Single Dose)</label>
                            <TextInput 
                                type="number" 
                                step="0.01"
                                className="w-full"
                                value={data.quantity}
                                onChange={e => setData('quantity', e.target.value)}
                                required
                            />
                            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Remarks / Notes</label>
                            <textarea 
                                className="w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500" 
                                rows="3"
                                placeholder="e.g. Injection site..."
                                value={data.remarks}
                                onChange={e => setData('remarks', e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded text-gray-700 font-bold hover:bg-gray-300">
                                Cancel
                            </button>
                            <PrimaryButton disabled={processing}>
                                Confirm & Save
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </HospitalLayout>
    );
}