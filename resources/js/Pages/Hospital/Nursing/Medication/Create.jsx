import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faHistory, faClock, faSyringe } from '@fortawesome/free-solid-svg-icons';

// 1. Add pharmacy_frequencies and pharmacy_durations to props
export default function MedicationCreate({ 
    patient, 
    prescriptions, 
    source_id, 
    source_type, 
    pharmacy_frequencies = [], 
    pharmacy_durations = [] 
}) {
    
    const [selectedRx, setSelectedRx] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        prescription_id: '',
        status: 'Given',
        quantity: 1,
        remarks: '',
        source_id: source_id,
        source_type: source_type,
    });

    const openAdminModal = (rx) => {
        setSelectedRx(rx);

        // --- CALCULATE QUANTITY TO ADMINISTER (SINGLE DOSE) ---
        
        let calculatedSingleDose = 0;
        const inputDosage = parseFloat(rx.dosage) || 0; // The dose ordered (e.g., 500)

        // Check if product has drug details (strength/formulation)
        const details = rx.product?.drug_details;

        if (inputDosage > 0) {
            if (details) {
                const type = parseInt(details.formulation_type); // 0 = Solid, 1 = Liquid
                const strength = parseFloat(details.strength_amount) || 0;
                
                // Logic: Dose Required / Strength per Unit
                // Example: Order 1000mg. Tablet is 500mg. Qty = 1000/500 = 2 tablets.
                if (strength > 0) {
                    calculatedSingleDose = inputDosage / strength;
                } else {
                    // Fallback: If no strength defined, assume dose = quantity (e.g., "2" tabs)
                    calculatedSingleDose = 0//inputDosage;
                }
            } else {
                // No details: Assume the dosage number is the quantity
                calculatedSingleDose = 0//inputDosage;
            }
        }

        // If calculation failed or resulted in 0, default to 1
        const defaultQty = calculatedSingleDose > 0 ? calculatedSingleDose : 1;

        // Round to 2 decimal places to be safe (e.g. 0.5 tablets)
        const finalQty = Math.round(defaultQty * 100) / 100;

        setData(prev => ({ 
            ...prev, 
            prescription_id: rx.id, 
            status: 'Given', 
            quantity: finalQty, 
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

    const formatTime = (iso) => new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    return (
        <HospitalLayout header={<h2>Medication Administration Record (MAR)</h2>}>
            <Head title="Administer Meds" />

            <div className="py-8 max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
                
                {/* --- Patient Info Sidebar --- */}
                <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-fit">
                    <div className="text-center mb-4">
                        <div className="h-14 w-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold text-indigo-700">
                            {patient.first_name[0]}
                        </div>
                        <h3 className="font-bold text-gray-900">{patient.first_name} {patient.last_name}</h3>
                        <p className="text-sm text-gray-500 font-mono">{patient.code}</p>
                    </div>
                    <div className="border-t pt-2 text-xs text-gray-600 space-y-1">
                        <p><strong>Age/Sex:</strong> {patient.age} / {patient.gender}</p>
                    </div>
                </div>

                {/* --- Main List --- */}
                <div className="w-full md:w-3/4 space-y-4">
                    {prescriptions.map((rx) => {
                        const totalGiven = rx.administrations 
                            ? rx.administrations.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0) 
                            : 0;
                        const remaining = (parseFloat(rx.quantity_prescribed) || 0) - totalGiven;
                        const isFinished = remaining <= 0;

                        return (
                            <div key={rx.id} className={`bg-white rounded-lg shadow-sm border ${isFinished ? 'border-gray-200 opacity-75' : 'border-blue-200'} overflow-hidden`}>
                                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                                    <div>
                                        <h4 className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                                            {rx.product?.name}
                                            {isFinished && <span className="bg-gray-200 text-gray-600 text-[10px] px-2 rounded">Completed</span>}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            <span className="font-bold">{rx.dosage}</span> • {rx.frequency} • {rx.duration}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-xs bg-white px-2 py-1 rounded border shadow-sm">
                                            Total: <strong>{rx.quantity_prescribed}</strong> | 
                                            Given: <strong>{totalGiven}</strong> | 
                                            <span className={`ml-1 font-bold ${remaining <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                Rem: {remaining.toFixed(2)}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => openAdminModal(rx)}
                                            disabled={isFinished}
                                            className={`px-4 py-2 rounded shadow font-bold text-sm flex items-center gap-2 transition-colors ${
                                                isFinished 
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faSyringe} /> Administer
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-white">
                                    <h5 className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faHistory} /> Recent Administration
                                    </h5>
                                    {rx.administrations && rx.administrations.length > 0 ? (
                                        <ul className="space-y-2">
                                            {rx.administrations.map(admin => (
                                                <li key={admin.id} className="flex justify-between text-sm border-b border-gray-100 pb-1 last:border-0">
                                                    <span className="flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs" />
                                                        {formatTime(admin.administered_at)}
                                                    </span>
                                                    <span className="font-mono text-xs font-bold bg-gray-100 px-2 rounded">
                                                        Qty: {admin.quantity}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                            admin.status === 'Given' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {admin.status}
                                                        </span>
                                                        <span className="text-xs text-gray-500 italic">by {admin.nurse?.name}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">No doses recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- ADMINISTER MODAL --- */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                        Administer Medication
                    </h3>
                    
                    <div className="mb-4 bg-blue-50 p-3 rounded text-sm border border-blue-100">
                        <p className="font-bold text-blue-900">{selectedRx?.product?.name}</p>
                        <p className="text-blue-700">Prescribed Dose: {selectedRx?.dosage}</p>
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
                            <label className="block text-sm font-bold text-gray-700 mb-2">Quantity Given (Single Dose)</label>
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
                                placeholder="e.g. Injection site, patient reaction..."
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