import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import ReactSelect from 'react-select';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faNotesMedical, faPills, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

export default function Discharge({ show, onClose, admission, diagnosisOptions = [] }) {
    
    const { data, setData, post, processing, reset, errors } = useForm({
        final_diagnosis: '',
        clinical_summary: '',
        treatment_given: '',
        discharge_medications: '',
        outcome: 'Recovered',
        follow_up_date: '',
        follow_up_instructions: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('doctor1.initiate', admission.id), {
            onSuccess: () => {
                toast.success("Discharge process initiated.");
                reset();
                onClose();
            },
            onError: () => toast.error("Please fill all required fields.")
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="3xl">
            <div className="p-6">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                            <FontAwesomeIcon icon={faDoorOpen} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Initiate Discharge</h2>
                            <p className="text-sm text-gray-500">
                                {admission.patient?.first_name} {admission.patient?.last_name}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">

                    {/* Diagnosis */}
                    <div>
                        <InputLabel value="Final Discharge Diagnosis *" />
                        <ReactSelect 
                            options={diagnosisOptions}
                            placeholder="Search Diagnosis..."
                            onChange={(opt) => setData('final_diagnosis', opt?.label)} // Storing text for summary
                            className="mt-1"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                        {errors.final_diagnosis && <p className="text-red-500 text-xs mt-1">{errors.final_diagnosis}</p>}
                    </div>

                    {/* Outcome */}
                    <div>
                        <InputLabel value="Outcome *" />
                        <select 
                            className="w-full border-gray-300 rounded shadow-sm focus:ring-indigo-500 mt-1"
                            value={data.outcome}
                            onChange={e => setData('outcome', e.target.value)}
                        >
                            <option value="Recovered">Recovered / Improved</option>
                            <option value="Referred">Referred</option>
                            <option value="DAMA">DAMA (Against Medical Advice)</option>
                            <option value="Deceased">Deceased</option>
                        </select>
                    </div>

                    {/* Clinical Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Clinical Course / Summary *" />
                            <TextArea 
                                className="w-full mt-1" rows={4}
                                placeholder="Brief summary of hospital stay..."
                                value={data.clinical_summary}
                                onChange={e => setData('clinical_summary', e.target.value)}
                            />
                            {errors.clinical_summary && <p className="text-red-500 text-xs mt-1">{errors.clinical_summary}</p>}
                        </div>
                        <div>
                            <InputLabel value="Treatment Given" />
                            <TextArea 
                                className="w-full mt-1" rows={4}
                                placeholder="Key procedures/medications..."
                                value={data.treatment_given}
                                onChange={e => setData('treatment_given', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="bg-green-50 p-4 rounded border border-green-100">
                        <InputLabel value="Discharge Medications (Take Home) *" className="text-green-800" />
                        <TextArea 
                            className="w-full mt-1 border-green-300 focus:border-green-500 focus:ring-green-500" 
                            rows={3}
                            placeholder="e.g. Tab Paracetamol 500mg TDS x 5 Days"
                            value={data.discharge_medications}
                            onChange={e => setData('discharge_medications', e.target.value)}
                        />
                        {errors.discharge_medications && <p className="text-red-500 text-xs mt-1">{errors.discharge_medications}</p>}
                    </div>

                    {/* Follow Up */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Follow Up Date" />
                            <TextInput 
                                type="date" className="w-full mt-1"
                                value={data.follow_up_date}
                                onChange={e => setData('follow_up_date', e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel value="Instructions / Remarks" />
                            <TextArea 
                                className="w-full mt-1" rows={2}
                                value={data.follow_up_instructions}
                                onChange={e => setData('follow_up_instructions', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                        <PrimaryButton 
                            disabled={processing}
                            className="bg-orange-600 hover:bg-orange-700 focus:bg-orange-700 active:bg-orange-800"
                        >
                            {processing ? 'Processing...' : 'Submit for Discharge'}
                        </PrimaryButton>
                    </div>

                </form>
            </div>
        </Modal>
    );
}