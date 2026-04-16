import React, { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import ReactSelect from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills, faPlus, faTrash, faTrashAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function PharmacyTab({ 
    data, 
    setData, 
    drugOptions, 
    ordered_meds = [], 
    rawDrugsList, 
    frequencies, 
    durations,
    facilityoption,
    onDeleteOrder,
    hasConfirmedDiagnosis // <--- NEW PROP
}) {
    
    const [newRx, setNewRx] = useState({
        product_id: '', product_name: '', dosage: 1, 
        frequency_id: '', duration_id: '', quantity: 0
    });
    const [selectedDrugDetails, setSelectedDrugDetails] = useState(null);
    const [finalStrenthUnit, setFinalStrenthUnit] = useState('mg');

    // --- EFFECT: Calculation Logic ---
    useEffect(() => {
        const freqObj = frequencies.find(f => f.id == newRx.frequency_id);
        const freqVal = freqObj ? parseFloat(freqObj.value) : 0;
        const durObj = durations.find(d => d.id == newRx.duration_id);
        const durDays = durObj ? parseInt(durObj.days) : 0;
        const inputDosage = parseFloat(newRx.dosage) || 0;

        let finalQty = 0;        

        if (inputDosage > 0 && freqVal > 0 && durDays > 0) {
            if (selectedDrugDetails) {
                const type = parseInt(selectedDrugDetails.formulation_type);
                const strengthAmt = parseFloat(selectedDrugDetails.strength_amount) || 0;
                const strengthVol = parseFloat(selectedDrugDetails.strength_volume) || 1;
                const bottleSize = parseFloat(selectedDrugDetails.total_volume) || 0;
                
                if(selectedDrugDetails.strength_unit){
                    setFinalStrenthUnit(selectedDrugDetails.strength_unit);
                }              

                if (strengthAmt > 0) {
                    const qtyPerDose = (inputDosage / strengthAmt) * strengthVol;
                    const totalNeeded = qtyPerDose * freqVal * durDays;

                    if (type === 0) {
                        finalQty = totalNeeded; 
                    } 
                    else if (type === 1 && bottleSize > 0) {
                        finalQty = totalNeeded / bottleSize;
                    }
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
        const allowNegative = facilityoption?.allownegativestock; 
        setNewRx(prev => ({ ...prev, product_id: opt.value, product_name: opt.label, dosage: initialDose, stock: fullDrug.current_stock, allowNegative: allowNegative }));
        setSelectedDrugDetails(details);
    };

    const handleAdd = () => {
        if (!hasConfirmedDiagnosis) {
            toast.error("Please confirm a diagnosis first!");
            return;
        }

        if (!newRx.product_id || newRx.quantity <= 0) {
            toast.error("Please check details and quantity.");
            return;
        }
        
        if (newRx.quantity > newRx.stock && !newRx.allowNegative) {
            toast.error(`Not enough stock. Available: ${newRx.stock}`);
            return;
        }

        const freqCode = frequencies.find(f => f.id == newRx.frequency_id)?.code || '';
        const durCode = durations.find(d => d.id == newRx.duration_id)?.code || '';

        const list = [...data.prescriptions, { 
            product_id: newRx.product_id, name: newRx.product_name, 
            dosage: newRx.dosage, frequency: freqCode, duration: durCode, quantity: newRx.quantity 
        }];
        setData('prescriptions', list);
        toast.success("Prescription staged.");
        setNewRx({ product_id: '', product_name: '', dosage: 1, frequency_id: '', duration_id: '', quantity: 0 }); 
        setSelectedDrugDetails(null); 
    };

    const removeRx = (index) => {
        const list = [...data.prescriptions];
        list.splice(index, 1);
        setData('prescriptions', list);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* 1. Medication History (Posted Orders) */}
            {ordered_meds?.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                    <h4 className="font-bold text-green-800 text-sm mb-2 uppercase tracking-wide">Current Medications</h4>
                    <ul className="text-sm space-y-1">
                        {ordered_meds.map(rx => (
                            <li key={rx.id} className="flex justify-between items-center border-b border-green-200 pb-1 last:border-0">
                                <span>{rx.product?.name} ({rx.dosage} x {rx.frequency})</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold text-xs ${rx.status === 'Dispensed' ? 'text-green-700' : 'text-yellow-700'}`}>{rx.status}</span>
                                    {/* DELETE BUTTON for Initial Stage */}
                                    {rx.status === 'Prescribed' && onDeleteOrder && (
                                        <button 
                                            type="button" 
                                            onClick={() => onDeleteOrder(rx.id, 'pharmacy')} 
                                            className="text-red-500 hover:text-red-700 ml-2" 
                                            title="Delete Prescription"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 2. Prescription Calculator */}
            <div className={`border border-gray-300 p-5 rounded-lg shadow-sm ${!hasConfirmedDiagnosis ? 'bg-gray-50' : 'bg-white'}`}>
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                    <FontAwesomeIcon icon={faPills} className={hasConfirmedDiagnosis ? "text-blue-500" : "text-gray-400"} /> 
                    Prescribe New Medication
                </h4>

                {/* SHOW WARNING MESSAGE IF NO DIAGNOSIS */}
                {!hasConfirmedDiagnosis && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm flex items-start gap-2">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5" />
                        <div>
                            <strong>Action Required:</strong> You cannot prescribe medications without a confirmed diagnosis. Please go back to the <strong>Diagnosis tab</strong> and set a diagnosis status to "Confirmed".
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    
                    {/* Drug Selection */}
                    <div className="md:col-span-3">
                        <InputLabel value="Drug" />
                        <ReactSelect 
                            isDisabled={!hasConfirmedDiagnosis} // <--- Disabled check
                            options={drugOptions} 
                            value={drugOptions.find(opt => opt.value === newRx.product_id) || null}
                            onChange={handleDrugSelect} 
                            placeholder={hasConfirmedDiagnosis ? "Search..." : "Requires diagnosis..."} 
                            menuPortalTarget={document.body} 
                            styles={{
                                menuPortal: base => ({...base, zIndex: 9999}),
                                control: base => ({...base, minHeight: '42px', backgroundColor: !hasConfirmedDiagnosis ? '#f3f4f6' : 'white'}) 
                            }} 
                        />
                    </div>

                    {/* Dose */}
                    <div className="md:col-span-2">
                        <InputLabel value="Dose" />
                        <TextInput 
                            disabled={!hasConfirmedDiagnosis} // <--- Disabled check
                            type="number" step="0.1" 
                            className={`w-full ${!hasConfirmedDiagnosis ? 'bg-gray-100 text-gray-500' : ''}`} 
                            value={newRx.dosage} 
                            onChange={e => setNewRx({...newRx, dosage: e.target.value})} 
                        />
                    </div>

                    {/* Freq */}
                    <div className="md:col-span-2">
                        <InputLabel value="Freq" />
                        <select 
                            disabled={!hasConfirmedDiagnosis} // <--- Disabled check
                            className={`w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500 h-[42px] ${!hasConfirmedDiagnosis ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
                            value={newRx.frequency_id} 
                            onChange={e => setNewRx({...newRx, frequency_id: e.target.value})}
                        >
                            <option value="">Select...</option>
                            {frequencies.map(f=><option key={f.id} value={f.id}>{f.code}</option>)}
                        </select>
                    </div>

                    {/* Dur */}
                    <div className="md:col-span-2">
                        <InputLabel value="Dur" />
                        <select 
                            disabled={!hasConfirmedDiagnosis} // <--- Disabled check
                            className={`w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500 h-[42px] ${!hasConfirmedDiagnosis ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
                            value={newRx.duration_id} 
                            onChange={e => setNewRx({...newRx, duration_id: e.target.value})}
                        >
                            <option value="">Select...</option>
                            {durations.map(d=><option key={d.id} value={d.id}>{d.code}</option>)}
                        </select>
                    </div>

                    {/* Qty */}
                    <div className="md:col-span-2">
                        <InputLabel value="Qty" />
                        <TextInput 
                            disabled={!hasConfirmedDiagnosis} // <--- Disabled check
                            type="number" step="1" 
                            className={`w-full ${!hasConfirmedDiagnosis ? 'bg-gray-100 text-gray-500' : ''}`} 
                            value={newRx.quantity} 
                            onChange={e => setNewRx({...newRx, quantity: e.target.value})} 
                        />
                    </div>

                    {/* Add Button */}
                    <div className="md:col-span-1">
                         <button 
                            type="button" 
                            disabled={!hasConfirmedDiagnosis} // <--- Disabled check
                            onClick={handleAdd} 
                            className={`w-full text-white h-[42px] rounded flex items-center justify-center shadow-sm transition-colors font-semibold ${!hasConfirmedDiagnosis ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </div>
                </div>
                
                {selectedDrugDetails && hasConfirmedDiagnosis && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                        Config: {selectedDrugDetails.formulation_type === 0 ? 'Solid' : 'Liquid'} | 
                        Str: {selectedDrugDetails.strength_amount}{selectedDrugDetails.strength_unit}
                        {selectedDrugDetails.formulation_type === 1 && ` | Vol: ${selectedDrugDetails.total_volume}${selectedDrugDetails.volume_unit}`}
                    </p>
                )}
            </div>

            {/* 3. Staged List (New Items) */}
            {data.prescriptions.map((p, i) => (
                <div key={i} className="text-sm border border-blue-100 py-2 px-3 flex justify-between items-center bg-white mb-2 rounded shadow-sm">
                    <span>
                        <strong className="text-gray-800">{p.name}</strong> 
                        <span className="mx-2 text-gray-400">|</span> 
                        {p.dosage}{finalStrenthUnit} x {p.frequency} for {p.duration}
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