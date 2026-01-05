import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import AsyncSelect from 'react-select/async'; // Import AsyncSelect
import axios from 'axios'; // Import Axios for search
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope, faNotesMedical } from '@fortawesome/free-solid-svg-icons';

export default function RecordEdit({ booking }) {
    
    // Logic: If status is 'Scheduled', default to 'In Progress'. Otherwise keep existing.
    const defaultStatus = booking.status === 'Scheduled' ? 'In Progress' : booking.status;

    const { data, setData, put, processing, errors } = useForm({
        status: defaultStatus,
        remarks: booking.remarks || '',
        icd_diagnosis_id: booking.icd_diagnosis_id || '', // Diagnosis ID
    });

    // --- ICD-10 Search Handler ---
    const loadDiagnosisOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < 2) {
            callback([]);
            return;
        }
        // Calls the backend search method
        axios.get(route('theatre2.diagnosis.search'), { params: { query: inputValue } })
            .then((response) => {
                callback(response.data);
            })
            .catch((error) => {
                console.error(error);
                callback([]);
            });
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('theatre2.update', booking.id));
    };

    return (
        <HospitalLayout header={<h2>Intra-Operative Record</h2>}>
            <Head title="Surgery Record" />

            <div className="py-8 max-w-3xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={submit} className="bg-white p-6 shadow-lg rounded-lg border border-gray-200">
                    
                    {/* Header Info */}
                    <div className="mb-6 border-b pb-4">
                        <h3 className="text-xl font-bold text-gray-800">{booking.patient.first_name} {booking.patient.last_name}</h3>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-gray-500 text-sm font-medium">{booking.procedure.name}</p>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{booking.patientcode}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* Status Select */}
                        <div>
                            <InputLabel value="Surgery Status" />
                            <select 
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                            >
                                <option value="In Progress">In Progress (Ongoing)</option>
                                <option value="Recovery">End Surgery (Send to Recovery)</option>
                            </select>
                            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                        </div>

                        {/* Diagnosis Select (Async) */}
                        <div>
                            <InputLabel value="Post-Operative Diagnosis (ICD-10)" />
                            <AsyncSelect 
                                cacheOptions 
                                loadOptions={loadDiagnosisOptions} 
                                defaultOptions={false} 
                                className="mt-1"
                                placeholder="Type to search diagnosis (e.g. Appendicitis)..."
                                onChange={(opt) => setData('icd_diagnosis_id', opt?.value)}
                                // Pre-fill if editing an existing record
                                defaultValue={
                                    booking.icd_diagnosis_id 
                                    ? { label: 'Loading previous...', value: booking.icd_diagnosis_id } 
                                    : null
                                }
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                menuPortalTarget={document.body}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                <FontAwesomeIcon icon={faStethoscope} className="mr-1"/> 
                                Search the ICD-10 database for the confirmed finding.
                            </p>
                            {errors.icd_diagnosis_id && <p className="text-red-500 text-xs mt-1">{errors.icd_diagnosis_id}</p>}
                        </div>

                        {/* Remarks */}
                        <div>
                            <InputLabel value="Surgical Notes / Findings" />
                            <textarea 
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows="6"
                                placeholder="Enter surgical details, complications, or specific findings..."
                                value={data.remarks}
                                onChange={e => setData('remarks', e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <PrimaryButton disabled={processing} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700">
                            Update & Save Record
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </HospitalLayout>
    );
}