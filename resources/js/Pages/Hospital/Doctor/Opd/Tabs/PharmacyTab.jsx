import React, { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import ReactSelect from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills, faPlus, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function PharmacyTab({ 
    data, 
    setData, 
    drugOptions, 
    ordered_meds = [], // Existing orders from DB
    rawDrugsList, 
    frequencies, 
    durations,
    onDeleteOrder // <--- NEW PROP for server-side delete
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
                
                // Numerator: e.g., 250 (mg)
                const strengthAmt = parseFloat(selectedDrugDetails.strength_amount) || 0;
                
                // Denominator: e.g., 5 (ml). Default to 1 for Solids.
                const strengthVol = parseFloat(selectedDrugDetails.strength_volume) || 1;
                
                // Bottle Size: e.g., 100 (ml)
                const bottleSize = parseFloat(selectedDrugDetails.total_volume) || 0;
                
                if(selectedDrugDetails.strength_unit){
                    setFinalStrenthUnit(selectedDrugDetails.strength_unit);
                }              

                // Prevent division by zero
                if (strengthAmt > 0) {
                    
                    // Step 1: Calculate how much physical product is needed per SINGLE dose
                    // Solid Logic: (500mg Dose / 500mg Strength) * 1 = 1 Tablet
                    // Liquid Logic: (250mg Dose / 250mg Strength) * 5ml = 5ml
                    const qtyPerDose = (inputDosage / strengthAmt) * strengthVol;

                    // Step 2: Calculate Total Amount needed for the full duration
                    const totalNeeded = qtyPerDose * freqVal * durDays;

                    if (type === 0) {
                        // SOLIDS: Inventory is usually tracked by Tablet/Capsule count
                        finalQty = totalNeeded; 
                    } 
                    else if (type === 1 && bottleSize > 0) {
                        // LIQUIDS: Inventory is tracked by Bottles
                        // Total mL needed / mL per bottle = Number of bottles
                        finalQty = totalNeeded / bottleSize;
                        
                        // Optional: Round up to nearest whole bottle if your hospital doesn't sell partial bottles
                        // finalQty = Math.ceil(finalQty); 
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

        const list = [...data.prescriptions, { 
            product_id: newRx.product_id, name: newRx.product_name, 
            dosage: newRx.dosage, frequency: freqCode, duration: durCode, quantity: newRx.quantity 
        }];
        setData('prescriptions', list);
        toast.success("Prescription staged.");
        setNewRx({ product_id: '', product_name: '', dosage: 1, frequency_id: '', duration_id: '', quantity: 0 }); 
        setSelectedDrugDetails(null); 
    };

    // Remove from STAGED list (Client-side only)
    const removeRx = (index) => {
        const list = [...data.prescriptions];
        list.splice(index, 1);
        setData('prescriptions', list);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* 1. Medication History (Posted Orders) */}
            {ordered_meds?.length > 0 && (
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider border-b pb-2">
                        Active Prescriptions
                    </h4>
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 text-xs uppercase bg-gray-50">
                            <tr>
                                <th className="p-2">Drug Name</th>
                                <th className="p-2">Details</th>
                                <th className="p-2">Status</th>
                                <th className="p-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ordered_meds.map(rx => (
                                <tr key={rx.id} className="hover:bg-gray-50">
                                    <td className="p-2 font-medium">{rx.product?.name}</td>
                                    <td className="p-2 text-gray-600">
                                        {rx.dosage} {rx.frequency} x {rx.duration}
                                    </td>
                                    <td className="p-2">
                                        <span className={`text-xs px-2 py-1 rounded font-bold ${
                                            rx.status === 'Dispensed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {rx.status}
                                        </span>
                                    </td>
                                    <td className="p-2 text-right">
                                        {/* DELETE BUTTON: Only show if status is 'Prescribed' (Initial stage) */}
                                        {rx.status === 'Prescribed' && onDeleteOrder && (
                                            <button 
                                                type="button" 
                                                onClick={() => onDeleteOrder(rx.id, 'pharmacy')} 
                                                className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center justify-end gap-1 w-full"
                                                title="Delete Order"
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} /> Del
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 2. Prescription Calculator */}
            <div className="border border-gray-300 p-5 rounded-lg bg-white shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                    <FontAwesomeIcon icon={faPills} className="text-blue-500" /> Prescribe New Medication
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    
                    {/* Drug Selection */}
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

                    {/* Dose */}
                    <div className="md:col-span-2">
                        <InputLabel value="Dose" />
                        <TextInput 
                            type="number" step="0.1" className="w-full" 
                            value={newRx.dosage} 
                            onChange={e => setNewRx({...newRx, dosage: e.target.value})} 
                        />
                    </div>

                    {/* Freq */}
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

                    {/* Dur */}
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

                    {/* Qty */}
                    <div className="md:col-span-2">
                        <InputLabel value="Qty" />
                        <TextInput 
                            type="number" step="1" className="w-full" 
                            value={newRx.quantity} 
                            onChange={e => setNewRx({...newRx, quantity: e.target.value})} 
                        />
                    </div>

                    {/* Add Button */}
                    <div className="md:col-span-1">
                         <button 
                            type="button" 
                            onClick={handleAdd} 
                            className="w-full bg-blue-600 text-white h-[42px] rounded hover:bg-blue-700 flex items-center justify-center shadow-sm transition-colors font-semibold"
                        >
                            <FontAwesomeIcon icon={faPlus} />
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