import React from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function HistoryTab({ data, setData }) {
    
    // --- Helper Functions for Chief Complaints ---
    const addComplaint = () => {
        setData('complaints', [...data.complaints, { chief_complaint: '', duration: '' }]);
    };

    const updateComplaint = (index, field, value) => {
        const list = [...data.complaints];
        list[index][field] = value;
        setData('complaints', list);
    };

    const removeComplaint = (index) => {
        const list = [...data.complaints];
        list.splice(index, 1);
        setData('complaints', list);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* 1. Chief Complaints Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <InputLabel value="Chief Complaints" className="font-bold text-gray-700" />
                    <button 
                        type="button" 
                        onClick={addComplaint} 
                        className="text-blue-600 text-sm hover:underline flex items-center gap-1 font-medium"
                    >
                        <FontAwesomeIcon icon={faPlus} /> Add Line
                    </button>
                </div>
                {data.complaints.map((c, i) => (
                    <div key={i} className="flex gap-3 mb-3 items-center">
                        <div className="flex-grow">
                            <TextInput 
                                placeholder="Complaint (e.g. Headache, Fever)" className="w-full"
                                value={c.chief_complaint} 
                                onChange={e => updateComplaint(i, 'chief_complaint', e.target.value)} 
                            />
                        </div>
                        <div className="w-1/4">
                            <TextInput 
                                placeholder="Duration" className="w-full"
                                value={c.duration} 
                                onChange={e => updateComplaint(i, 'duration', e.target.value)} 
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => removeComplaint(i)} 
                            className="text-red-500 hover:bg-red-100 p-2 rounded-full transition"
                            title="Remove line"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                ))}
            </div>
            
            {/* 2. History of Presenting Illness */}
            <div>
                <InputLabel value="History of Presenting Illness (HPI)" className="text-lg font-semibold text-blue-800" />
                <TextArea 
                    className="w-full mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500" 
                    rows={5} 
                    placeholder="Detailed chronological description of the illness..."
                    value={data.history_presenting_illness} 
                    onChange={e => setData('history_presenting_illness', e.target.value)} 
                />
            </div>

            {/* 3. Past Medical & Social History (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputLabel value="Past Medical History" />
                    <TextArea 
                        className="w-full mt-1" 
                        rows={4} 
                        placeholder="Previous surgeries, chronic conditions, hospitalizations..."
                        value={data.past_medical_history} 
                        onChange={e => setData('past_medical_history', e.target.value)} 
                    />
                </div>
                <div>
                    <InputLabel value="Social & Family History" />
                    <TextArea 
                        className="w-full mt-1" 
                        rows={4} 
                        placeholder="Smoking, alcohol, hereditary diseases, occupation..."
                        value={data.social_and_family_history} 
                        onChange={e => setData('social_and_family_history', e.target.value)} 
                    />
                </div>
            </div>

            {/* 4. Review of Other Systems */}
            <div>
                <InputLabel value="Review of Other Systems (ROS)" />
                <TextArea 
                    className="w-full mt-1" 
                    rows={3} 
                    placeholder="General, HEENT, Respiratory, CVS, GI, GU, Neuro, Skin..."
                    value={data.review_of_other_systems} 
                    onChange={e => setData('review_of_other_systems', e.target.value)} 
                />
            </div>
        </div>
    );
}