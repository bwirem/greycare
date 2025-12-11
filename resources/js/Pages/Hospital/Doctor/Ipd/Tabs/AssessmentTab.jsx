import React from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import Checkbox from '@/Components/Checkbox';

export default function AssessmentTab({ data, setData, errors = {} }) {
    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* Vitals Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputLabel value="General Condition" />
                    <TextInput 
                        className="w-full mt-1" 
                        placeholder="e.g. Stable, Febrile, Alert" 
                        value={data.general_condition} 
                        onChange={e => setData('general_condition', e.target.value)} 
                    />
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

            {/* Checkboxes */}
            <div className="flex gap-6 p-4 bg-gray-50 rounded border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox checked={data.pallor} onChange={e => setData('pallor', e.target.checked)} /> 
                    <span className="text-gray-700 font-medium">Pallor</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Checkbox checked={data.jaundice} onChange={e => setData('jaundice', e.target.checked)} /> 
                    <span className="text-gray-700 font-medium">Jaundice</span>
                </label>
            </div>

            {/* Systemic Exam */}
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

            {/* Notes & Plan (With Validation Feedback) */}
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