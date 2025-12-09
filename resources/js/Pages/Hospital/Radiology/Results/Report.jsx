import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import HospitalLayout from '@/Layouts/HospitalLayout';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextArea from '@/Components/TextArea'; // Ensure this component exists

export default function ReportEditor({ request_data, patient, procedure, existing_report }) {
    
    const { data, setData, post, processing } = useForm({
        findings: existing_report?.findings || '',
        impression: existing_report?.impression || '',
        recommendation: existing_report?.recommendation || '',
        is_final: false
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('radiology.results.store', request_data.id));
    };

    return (
        <HospitalLayout header={<h2>Write Report: {procedure.name}</h2>}>
            <Head title="Radiology Report" />

            <div className="py-8 max-w-5xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={submit} className="bg-white p-6 shadow rounded-lg">
                    
                    {/* Patient Banner */}
                    <div className="flex justify-between border-b pb-4 mb-6 bg-gray-50 p-4 rounded">
                        <div>
                            <span className="text-gray-500 text-xs uppercase">Patient</span>
                            <div className="font-bold text-lg">{patient.first_name} {patient.last_name}</div>
                            <div className="text-sm">{patient.age}y / {patient.gender}</div>
                        </div>
                        <div className="text-right">
                            <span className="text-gray-500 text-xs uppercase">Modality</span>
                            <div className="font-mono font-bold text-lg">{procedure.modality.code}</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <InputLabel value="Findings / Observations" />
                            <TextArea 
                                className="w-full mt-1 font-mono text-sm" 
                                rows="10"
                                placeholder="Describe imaging findings here..."
                                value={data.findings}
                                onChange={e => setData('findings', e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel value="Impression / Diagnosis" />
                            <TextArea 
                                className="w-full mt-1 font-bold" 
                                rows="3"
                                placeholder="Summary of findings..."
                                value={data.impression}
                                onChange={e => setData('impression', e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel value="Recommendation (Optional)" />
                            <TextArea 
                                className="w-full mt-1" 
                                rows="2"
                                value={data.recommendation}
                                onChange={e => setData('recommendation', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 border-t pt-4 mt-6">
                        <label className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                checked={data.is_final}
                                onChange={e => setData('is_final', e.target.checked)}
                            />
                            <span className="text-sm font-bold text-gray-700">Finalize & Sign Report</span>
                        </label>
                        <PrimaryButton disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                            Save Report
                        </PrimaryButton>
                    </div>

                </form>
            </div>
        </HospitalLayout>
    );
}