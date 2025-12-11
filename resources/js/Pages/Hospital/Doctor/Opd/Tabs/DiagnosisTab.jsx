import React from 'react';
import InputLabel from '@/Components/InputLabel';
import ReactSelect from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

export default function DiagnosisTab({ data, setData, options }) {
    
    const addDiagnosis = (opt) => {
        setData('diagnoses', [...data.diagnoses, { id: opt.value, label: opt.label, type: 'icd', status: 'provisional' }]);
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
        <div className="space-y-6 animate-fade-in">
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg shadow-sm">
                <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faStethoscope} /> Add Diagnosis
                </h3>
                <ReactSelect 
                    options={options} 
                    className="mt-1"
                    placeholder="Search ICD-10 Code or Description..."
                    onChange={addDiagnosis}
                    value={null}
                />
            </div>

            <div className="mt-4">
                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Selected Diagnoses</h4>
                <div className="space-y-2">
                    {data.diagnoses.map((d, i) => (
                        <div key={i} className="flex justify-between items-center bg-white border border-gray-200 shadow-sm p-3 rounded-md">
                            <span className="font-medium text-gray-800">{d.label}</span>
                            <div className="flex gap-2 items-center">
                                <select 
                                    className="border-gray-300 rounded text-sm py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                                    value={d.status}
                                    onChange={e => updateStatus(i, e.target.value)}
                                >
                                    <option value="provisional">Provisional</option>
                                    <option value="confirmed">Confirmed</option>
                                </select>
                                <button type="button" onClick={() => removeDiagnosis(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {data.diagnoses.length === 0 && <p className="text-gray-400 italic text-sm p-2 text-center border border-dashed rounded">No diagnoses added yet.</p>}
                </div>
            </div>
        </div>
    );
}