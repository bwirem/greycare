import React from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import Checkbox from '@/Components/Checkbox';
import ReactSelect from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faStethoscope, faTrash, faLink, faUnlink, faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';

export default function AssessmentTab({ data, setData, errors = {}, diagnosisOptions = [] }) {
    
    // --- 1. Diagnosis Helper Functions ---

    const addDiagnosis = (opt) => {
        if (!opt) return;

        const exists = data.diagnoses?.find(d => d.id === opt.value);
        if (exists) return;

        const newDiag = { 
            id: opt.value, 
            label: opt.label, 
            type: opt.type || 'icd', 
            status: 'provisional',
            
            // Capture Name AND ID
            linked_mtuha: opt.mtuha_label || null,
            linked_mtuha_id: opt.mtuha_id || null // <--- Add this to state
        };
        
        const currentList = data.diagnoses || [];
        setData('diagnoses', [...currentList, newDiag]);
    };
    

    const removeDiagnosis = (index) => {
        const list = [...(data.diagnoses || [])];
        list.splice(index, 1);
        setData('diagnoses', list);
    };

    const updateDiagStatus = (index, val) => {
        const list = [...(data.diagnoses || [])];
        list[index].status = val;
        setData('diagnoses', list);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* --- SECTION 1: VITALS & GENERAL --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputLabel value="General Condition" />
                    <TextInput 
                        className={`w-full mt-1 ${errors.general_condition ? 'border-red-500' : ''}`}
                        placeholder="e.g. Stable, Febrile, Alert, Pallor++" 
                        value={data.general_condition} 
                        onChange={e => setData('general_condition', e.target.value)} 
                    />
                    {errors.general_condition && <p className="text-red-500 text-xs mt-1">{errors.general_condition}</p>}
                </div>
                <div>
                    <InputLabel value="Glasgow Coma Scale (GCS)" />
                    <TextInput 
                        className="w-full mt-1" 
                        placeholder="e.g. 15/15" 
                        value={data.glasgow_coma_score} 
                        onChange={e => setData('glasgow_coma_score', e.target.value)} 
                    />
                </div>
            </div>

            {/* --- SECTION 2: CLINICAL SIGNS --- */}
            <div className="flex flex-wrap gap-6 p-4 bg-gray-50 rounded border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox checked={data.pallor} onChange={e => setData('pallor', e.target.checked)} /> 
                    <span className="text-gray-700 font-medium">Pallor</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox checked={data.jaundice} onChange={e => setData('jaundice', e.target.checked)} /> 
                    <span className="text-gray-700 font-medium">Jaundice</span>
                </label>
                {/* Add more checkboxes here (Cyanosis, Edema, etc.) if needed */}
            </div>

            {/* --- SECTION 3: SYSTEMIC EXAMINATION --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <InputLabel value="Respiratory System" />
                    <TextArea 
                        className="w-full mt-1" rows={2} 
                        value={data.rs_examination} onChange={e => setData('rs_examination', e.target.value)} 
                    />
                </div>
                <div>
                    <InputLabel value="Cardiovascular System" />
                    <TextArea 
                        className="w-full mt-1" rows={2} 
                        value={data.cvs_examination} onChange={e => setData('cvs_examination', e.target.value)} 
                    />
                </div>
                <div className="md:col-span-2">
                    <InputLabel value="Abdomen / GI" />
                    <TextArea 
                        className="w-full mt-1" rows={2} 
                        value={data.abdomen_examination} onChange={e => setData('abdomen_examination', e.target.value)} 
                    />
                </div>
            </div>

            <hr className="border-gray-200 my-2"/>

            {/* --- SECTION 4: DIAGNOSIS (ICD Primary -> Mtuha Map) --- */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-indigo-800 font-bold flex items-center gap-2">
                        <FontAwesomeIcon icon={faStethoscope} /> Diagnosis
                    </h4>
                    <span className="text-[10px] uppercase tracking-wide text-indigo-400 font-bold">
                        Search Standard ICD-10
                    </span>
                </div>
                
                <div className="mb-3">
                    <ReactSelect 
                        options={diagnosisOptions}
                        placeholder="Type ICD Code or Name to search..."
                        onChange={addDiagnosis}
                        value={null} // Clear input after selection
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        menuPortalTarget={document.body}
                        
                        // Custom Dropdown Option: Show ICD on left, Mtuha hint on right
                        formatOptionLabel={option => (
                            <div className="flex justify-between items-center w-full">
                                <span className="font-medium text-gray-800">{option.label}</span>
                                {option.mtuha_label && (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200 ml-2 whitespace-nowrap">
                                        Mtuha: {option.mtuha_label}
                                    </span>
                                )}
                            </div>
                        )}
                    />
                </div>

                {/* List of Added Diagnoses */}
                <div className="space-y-2">
                    {data.diagnoses && data.diagnoses.map((d, i) => (
                        <div key={i} className="bg-white p-3 rounded shadow-sm border border-indigo-100 text-sm">
                            
                            <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                                {/* LEFT: ICD-10 (The Doctor's Selection) */}
                                <div className="w-3/5 pr-2 border-r border-gray-100">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                        ICD-10 Standard
                                    </span>
                                    <span className="font-bold text-gray-800 text-base block">{d.label}</span>
                                </div>

                                {/* RIGHT: Mtuha Mapping (System Auto-match) */}
                                <div className="w-2/5 pl-2 text-right flex flex-col justify-center h-full">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                        Mapped Mtuha
                                    </span>
                                    
                                    {d.linked_mtuha ? (
                                        <div className="text-green-700 font-medium flex items-center justify-end gap-1 bg-green-50 px-2 py-1 rounded self-end">
                                            <FontAwesomeIcon icon={faLink} className="text-xs"/> 
                                            <span className="truncate max-w-[150px]" title={d.linked_mtuha}>
                                                {d.linked_mtuha}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 italic flex items-center justify-end gap-1">
                                            <FontAwesomeIcon icon={faUnlink} className="text-xs"/> 
                                            <span>Not Mapped</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BOTTOM ROW: Status & Actions */}
                            <div className="flex justify-end gap-2 items-center pt-1">
                                <select 
                                    className="border-gray-300 rounded text-xs py-1 h-8 focus:ring-indigo-500 bg-gray-50 text-gray-700"
                                    value={d.status}
                                    onChange={(e) => updateDiagStatus(i, e.target.value)}
                                >
                                    <option value="provisional">Provisional</option>
                                    <option value="differential">Differential</option>
                                    <option value="confirmed">Confirmed</option>
                                </select>
                                <button 
                                    type="button" 
                                    onClick={() => removeDiagnosis(i)} 
                                    className="text-red-500 hover:text-red-700 bg-red-50 h-8 w-8 rounded flex items-center justify-center transition hover:bg-red-100"
                                    title="Remove Diagnosis"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {(!data.diagnoses || data.diagnoses.length === 0) && (
                        <div className="text-center p-4 border-2 border-dashed border-indigo-200 rounded text-gray-400 text-sm italic">
                            Search above to add diagnoses.
                        </div>
                    )}
                </div>
            </div>

            {/* --- SECTION 5: NOTES & PLAN --- */}
            <div className="space-y-4">
                <div>
                    <InputLabel value="Progress Notes / Clinical Summary *" className="text-lg font-bold text-blue-800" />
                    <TextArea 
                        className={`w-full mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${errors.clinical_notes ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        rows={6} 
                        value={data.clinical_notes} 
                        onChange={e => setData('clinical_notes', e.target.value)} 
                        placeholder="Patient condition, new complaints, observations..."
                    />
                    {errors.clinical_notes && <p className="text-red-500 text-sm mt-1">{errors.clinical_notes}</p>}
                </div>
                <div>
                    <InputLabel value="Treatment Plan" className="text-lg font-bold text-green-800" />
                    <TextArea 
                        className="w-full mt-1 border-green-200 focus:border-green-500 focus:ring-green-500" 
                        rows={3} 
                        value={data.treatment_plan} 
                        onChange={e => setData('treatment_plan', e.target.value)} 
                        placeholder="Continue meds, discharge plan, new orders..."
                    />
                </div>
            </div>
        </div>
    );
}