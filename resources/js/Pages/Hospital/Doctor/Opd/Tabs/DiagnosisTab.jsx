import React from 'react';
import ReactSelect from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faStethoscope, faTrash, faLink, faUnlink, 
    faHistory, faUserMd, faCalendarAlt, faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function DiagnosisTab({ data, setData, options, previous_diagnoses = [] }) {
    
    // --- 1. Form Handlers ---

    const addDiagnosis = (opt) => {
        if (!opt) return;

        // Prevent duplicates in the current session list
        const exists = data.diagnoses?.find(d => d.id === opt.value);
        if (exists) return;

        const newDiag = { 
            id: opt.value, 
            label: opt.label, 
            type: 'icd', 
            status: 'provisional',
            // Capture mapping info if available
            linked_mtuha: opt.mtuha_label || null,
            linked_mtuha_id: opt.mtuha_id || null
        };

        const list = [...data.diagnoses, newDiag];
        setData('diagnoses', list);
        toast.info("Diagnosis added.");
    };

    const removeDiagnosis = (index) => {
        const list = [...data.diagnoses];
        list.splice(index, 1);
        setData('diagnoses', list);
    };

    const updateStatus = (index, val) => {
        const list = [...data.diagnoses];
        list[index].status = val;
        setData('diagnoses', list);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            
            {/* --- SECTION 1: DIAGNOSIS HISTORY --- */}
            {previous_diagnoses.length > 0 ? (
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                            <FontAwesomeIcon icon={faHistory} className="text-blue-500"/> Patient Diagnosis History
                        </h4>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                            {previous_diagnoses.length} Records
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-4 py-3 w-32">Date</th>
                                    <th className="px-4 py-3 w-1/3">ICD-10 Standard</th>                                   
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Doctor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {previous_diagnoses                                   
                                    .map((diag, index) => (
                                    <tr key={index} className="hover:bg-blue-50 transition-colors">
                                        {/* Date */}
                                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300"/>
                                                {new Date(diag.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        
                                        {/* ICD Column */}
                                        <td className="px-4 py-3">
                                            {diag.icd_code && diag.icd_code !== '-' && (
                                                <div>
                                                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                                        {diag.icd_code}
                                                    </span>
                                                    <span className="block text-gray-700 text-xs mt-1 leading-tight">
                                                        {diag.icd_name}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        
                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                diag.status_label === 'Confirmed' 
                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                                {diag.status_label || 'Provisional'}
                                            </span>
                                        </td>

                                        {/* Doctor */}
                                        <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                            <div className="flex items-center justify-end gap-1">
                                                <FontAwesomeIcon icon={faUserMd}/> 
                                                {diag.user_name || 'Unknown'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-gray-400 text-sm italic">No previous diagnosis history found.</p>
                </div>
            )}

            <div className="border-t border-gray-200"></div>

            {/* --- SECTION 2: ADD NEW DIAGNOSIS --- */}
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                        <FontAwesomeIcon icon={faStethoscope} /> Add Diagnosis
                    </h3>
                    <span className="text-[10px] uppercase tracking-wide text-indigo-400 font-bold bg-white px-2 py-1 rounded">
                        Search Standard ICD-10
                    </span>
                </div>

                <ReactSelect 
                    options={options} 
                    className="mt-1"
                    placeholder="Search ICD-10 Code or Description..."
                    onChange={addDiagnosis}
                    value={null}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    menuPortalTarget={document.body}
                    // Show hints in dropdown if Mtuha mapping exists
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

            {/* --- SECTION 3: CURRENTLY SELECTED LIST --- */}
            <div>
                <h4 className="font-bold text-gray-700 mb-3 border-b pb-1 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600"/> Selected for this Visit
                </h4>
                
                <div className="space-y-3">
                    {data.diagnoses.map((d, i) => (
                        <div key={i} className="bg-white p-3 rounded shadow-sm border border-indigo-100 text-sm">
                            
                            <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                                {/* LEFT: ICD-10 Selection */}
                                <div className="w-3/5 pr-2 border-r border-gray-100">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                        ICD-10 Standard
                                    </span>
                                    <span className="font-bold text-gray-800 text-base block">{d.label}</span>
                                </div> 

                                {/* BOTTOM: Status & Actions */}
                                <div className="flex justify-end gap-2 items-center pt-1">
                                    <select 
                                        className="border-gray-300 rounded text-xs py-1 h-8 focus:ring-indigo-500 bg-gray-50 text-gray-700"
                                        value={d.status}
                                        onChange={e => updateStatus(i, e.target.value)}
                                    >
                                        <option value="provisional">Provisional</option>
                                        <option value="differential">Differential</option>
                                        <option value="confirmed">Confirmed</option>
                                    </select>
                                    <button 
                                        type="button" 
                                        onClick={() => removeDiagnosis(i)} 
                                        className="text-red-500 hover:text-red-700 bg-red-50 h-8 w-8 rounded flex items-center justify-center transition hover:bg-red-100"
                                        title="Remove from list"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>                                                            
                            </div>                                
                        </div>
                    ))}
                    
                    {data.diagnoses.length === 0 && (
                        <p className="text-gray-400 italic text-sm p-4 text-center border-2 border-dashed border-gray-200 rounded">
                            No diagnoses selected for this session yet.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}