import React from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import Checkbox from '@/Components/Checkbox';

export default function ExaminationTab({ data, setData }) {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputLabel value="General Condition" />
                    <TextInput 
                        className="w-full mt-1" placeholder="e.g. Stable, Sick looking" 
                        value={data.general_condition} onChange={e => setData('general_condition', e.target.value)} 
                    />
                </div>
                <div>
                    <InputLabel value="Glasgow Coma Scale (GCS)" />
                    <TextInput 
                        className="w-full mt-1" placeholder="e.g. 15/15" 
                        value={data.glasgow_coma_score} onChange={e => setData('glasgow_coma_score', e.target.value)} 
                    />
                </div>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <InputLabel value="Respiratory System" />
                    <TextArea className="w-full mt-1" rows={3} value={data.rs_examination} onChange={e => setData('rs_examination', e.target.value)} />
                </div>
                <div>
                    <InputLabel value="Cardiovascular System" />
                    <TextArea className="w-full mt-1" rows={3} value={data.cvs_examination} onChange={e => setData('cvs_examination', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                    <InputLabel value="Abdomen / GI" />
                    <TextArea className="w-full mt-1" rows={3} value={data.abdomen_examination} onChange={e => setData('abdomen_examination', e.target.value)} />
                </div>
            </div>
        </div>
    );
}