import React, { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import ReactSelect from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function PharmacyTab({ 
    data, setData, drugOptions, ordered_meds, 
    opd_meds = [], // Received from Parent
    rawDrugsList, frequencies, durations 
}) {

    const [newRx, setNewRx] = useState({
        product_id: '', product_name: '', dosage: 1, 
        frequency_id: '', duration_id: '', quantity: 0
    });
    const [selectedDrugDetails, setSelectedDrugDetails] = useState(null);

    // --- EFFECT: Calculation Logic ---
    useEffect(() => {
        const freqObj = frequencies.find(f => f.id == newRx.frequency_id);
        const freqVal = freqObj ? parseFloat(freqObj.value) : 0;
        const durObj = durations.find(d => d.id == newRx.duration_id);
        const durDays = durObj ? parseInt(durObj.days) : 0;
        const inputDosage = parseFloat(newRx.dosage) || 0;

        let finalQty = 0;

        if (inputDosage > 0 && freqVal > 0 && durDays > 0) {
            finalQty = inputDosage * freqVal * durDays;

            if (selectedDrugDetails) {
                const type = parseInt(selectedDrugDetails.formulation_type);
                const strength = parseFloat(selectedDrugDetails.strength_amount) || 0;
                const bottleSize = parseFloat(selectedDrugDetails.total_volume) || 0;

                if (type === 0 && strength > 0 && inputDosage >= strength) {
                    finalQty = (inputDosage / strength) * freqVal * durDays;
                } else if (type === 1 && bottleSize > 0) {
                    finalQty = (inputDosage * freqVal * durDays) / bottleSize;
                }
            }
        }
        const rounded = Math.ceil(finalQty);
        setNewRx(prev => ({ ...prev, quantity: isNaN(rounded) ? 0 : rounded }));
    }, [newRx.dosage, newRx.frequency_id, newRx.duration_id, selectedDrugDetails]);

    const handleDrugSelect = (opt) => {
        if (!opt) {
            setNewRx(prev => ({ ...prev, product_id: '', product_name: '', dosage: 1, quantity: 0 }));
            setSelectedDrugDetails(null);
            return;
        }
        const fullDrug = rawDrugsList.find(d => d.id === opt.value);
        const details = fullDrug?.drug_details || null;
        const initialDose = details && parseFloat(details.strength_amount) > 0 
            ? parseFloat(details.strength_amount) : 1;

        setNewRx(prev => ({ ...prev, product_id: opt.value, product_name: opt.label, dosage: initialDose }));
        setSelectedDrugDetails(details);
    };

    const handleAdd = () => {
        if (!newRx.product_id || newRx.quantity <= 0) {
            toast.error("Please check details and quantity.");
            return;
        }
        const freqCode = frequencies.find(f => f.id == newRx.frequency_id)?.code || '';
        const durCode = durations.find(d => d.id == newRx.duration_id)?.code || '';

        // FIX: Ensure we reference the correct array property (new_prescriptions)
        // If data.new_prescriptions is undefined (e.g. OPD use case), fallback to data.prescriptions
        const listKey = Array.isArray(data.new_prescriptions) ? 'new_prescriptions' : 'prescriptions';
        const currentList = data[listKey] || [];

        const list = [...currentList, { 
            product_id: newRx.product_id, name: newRx.product_name, 
            dosage: newRx.dosage, frequency: freqCode, duration: durCode, quantity: newRx.quantity 
        }];
        
        // FIX: Update the correct key
        setData(listKey, list);
        
        toast.success("Prescription staged.");
        setNewRx({ product_id: '', product_name: '', dosage: 1, frequency_id: '', duration_id: '', quantity: 0 }); 
        setSelectedDrugDetails(null); 
    };

    const removeRx = (index) => {
        // FIX: Ensure correct key usage
        const listKey = Array.isArray(data.new_prescriptions) ? 'new_prescriptions' : 'prescriptions';
        const list = [...data[listKey]];
        list.splice(index, 1);
        setData(listKey, list);
    };

    // Helper to determine which list to map over for display
    const prescriptionsToDisplay = data.new_prescriptions || data.prescriptions || [];

    return (
        <div className="space-y-6 animate-fade-in">          
            {/* 1. OPD MEDICATION HISTORY (NEW) */}
            {opd_meds.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                    <h4 className="font-bold text-blue-800 text-sm mb-2 uppercase tracking-wide">OPD Medications (Admission)</h4>
                    <ul className="text-sm space-y-1">
                        {opd_meds.map(rx => (
                            <li key={'opd-'+rx.id} className="flex justify-between border-b border-blue-200 pb-1 last:border-0">
                                <span>{rx.product?.name} ({rx.dosage} x {rx.frequency})</span>
                                <span className="text-xs text-gray-500 italic">{new Date(rx.created_at).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 2. WARD MEDICATION HISTORY */}
            {ordered_meds?.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                    <h4 className="font-bold text-green-800 text-sm mb-2 uppercase tracking-wide">Current Ward Medications</h4>
                    <ul className="text-sm space-y-1">
                        {ordered_meds.map(rx => (
                            <li key={rx.id} className="flex justify-between border-b border-green-200 pb-1 last:border-0">
                                <span>{rx.product?.name} ({rx.dosage} x {rx.frequency})</span>
                                <span className={`font-bold text-xs ${rx.status === 'Dispensed' ? 'text-green-700' : 'text-yellow-700'}`}>{rx.status}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Prescription Calculator */}
            <div className="border border-gray-300 p-5 rounded-lg bg-white shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                    <FontAwesomeIcon icon={faPills} className="text-blue-500" /> Prescribe New Medication
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    
                    {/* 1. Drug */}
                    <div className="md:col-span-3">
                        <InputLabel value="Drug" />
                        <ReactSelect 
                            options={drugOptions} 
                            value={drugOptions.find(opt => opt.value === newRx.product_id) || null}
                            onChange={handleDrugSelect} 
                            placeholder="Search..." 
                            menuPortalTarget={document.body} 
                            styles={{
                                menuPortal: base => ({...base, zIndex: 9999}),
                                control: base => ({...base, minHeight: '42px'}) 
                            }} 
                        />
                    </div>

                    {/* 2. Dose */}
                    <div className="md:col-span-2">
                        <InputLabel value="Dose" />
                        <TextInput 
                            type="number" step="0.1" className="w-full" 
                            value={newRx.dosage} 
                            onChange={e => setNewRx({...newRx, dosage: e.target.value})} 
                        />
                    </div>

                    {/* 3. Freq */}
                    <div className="md:col-span-2">
                        <InputLabel value="Freq" />
                        <select 
                            className="w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500 h-[42px]" 
                            value={newRx.frequency_id} 
                            onChange={e => setNewRx({...newRx, frequency_id: e.target.value})}
                        >
                            <option value="">Select...</option>
                            {frequencies.map(f=><option key={f.id} value={f.id}>{f.code}</option>)}
                        </select>
                    </div>

                    {/* 4. Dur */}
                    <div className="md:col-span-2">
                        <InputLabel value="Dur" />
                        <select 
                            className="w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500 h-[42px]" 
                            value={newRx.duration_id} 
                            onChange={e => setNewRx({...newRx, duration_id: e.target.value})}
                        >
                            <option value="">Select...</option>
                            {durations.map(d=><option key={d.id} value={d.id}>{d.code}</option>)}
                        </select>
                    </div>

                    {/* 5. Calculated Qty Display */}
                    <div className="md:col-span-1">
                        <InputLabel value="Qty" />
                        <div className="w-full h-[42px] bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-blue-800 font-bold px-1" title="Calculated Quantity">
                           {newRx.quantity}
                        </div>
                    </div>

                    {/* 6. Add Button */}
                    <div className="md:col-span-2">
                         <button 
                            type="button" 
                            onClick={handleAdd} 
                            className="w-full bg-blue-600 text-white h-[42px] rounded hover:bg-blue-700 flex items-center justify-center shadow-sm transition-colors font-semibold"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add
                        </button>
                    </div>

                </div>
                
                {selectedDrugDetails && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                        Config: {selectedDrugDetails.formulation_type === 0 ? 'Solid' : 'Liquid'} | 
                        Str: {selectedDrugDetails.strength_amount}{selectedDrugDetails.strength_unit}
                        {selectedDrugDetails.formulation_type === 1 && ` | Vol: ${selectedDrugDetails.total_volume}${selectedDrugDetails.volume_unit}`}
                    </p>
                )}
            </div>

            {/* Staged List */}
            {prescriptionsToDisplay.map((p, i) => (
                <div key={i} className="text-sm border border-blue-100 py-2 px-3 flex justify-between items-center bg-white mb-2 rounded shadow-sm">
                    <span>
                        <strong className="text-gray-800">{p.name}</strong> 
                        <span className="mx-2 text-gray-400">|</span> 
                        {p.dosage} x {p.frequency} for {p.duration}
                    </span>
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs">Qty: {p.quantity}</span>
                        <button type="button" onClick={()=>removeRx(i)} className="text-red-500 hover:text-red-700 transition">
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}