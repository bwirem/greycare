import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope, faUserMd, faPills, faFlask, faNotesMedical } from '@fortawesome/free-solid-svg-icons';

export default function RoundHistoryTab({ history, opdData }) {
    
    return (
        <div className="space-y-8 animate-fade-in pb-10">
            
            {/* 1. IPD Ward Rounds (Latest First) */}
            {history.map((round) => (
                <div key={round.id} className="border-l-4 border-green-500 bg-white shadow-sm p-5 rounded-r-lg relative">
                    <span className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-lg font-bold">IPD Round</span>
                    
                    <div className="flex justify-between items-start mb-3 border-b pb-2">
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                {new Date(round.round_date).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                                <FontAwesomeIcon icon={faUserMd} className="mr-1" />
                                Dr. {round.doctor?.name || 'Unknown'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <span className="block text-xs font-bold uppercase text-gray-500">Progress Notes</span>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1">{round.clinical_notes}</p>
                        </div>
                        {round.treatment_plan && (
                            <div className="bg-green-50 p-3 rounded border border-green-100">
                                <span className="block text-xs font-bold uppercase text-green-700">Plan</span>
                                <p className="text-sm text-green-900 mt-1">{round.treatment_plan}</p>
                            </div>
                        )}
                        <div className="text-xs text-gray-600 mt-2">
                            <strong>Condition:</strong> {round.general_condition || '-'}
                        </div>
                    </div>
                </div>
            ))}

            {history.length === 0 && !opdData && (
                <div className="flex flex-col items-center justify-center h-20 text-gray-400">
                    <p className="italic">No medical history recorded.</p>
                </div>
            )}

            {/* 2. Divider */}
            {opdData && (
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-widest">Admission / Initial Consult</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
            )}

            {/* 3. OPD Consultation Data (The Base of the Timeline) */}
            {opdData && (
                <div className="border-l-4 border-blue-500 bg-blue-50 shadow-sm p-5 rounded-r-lg relative opacity-90">
                    <span className="absolute top-0 right-0 bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-bl-lg font-bold">OPD Consultation</span>
                    
                    <div className="flex justify-between items-start mb-4 border-b border-blue-200 pb-2">
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                {new Date(opdData.created_at).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                                <FontAwesomeIcon icon={faUserMd} className="mr-1" />
                                Dr. {opdData.user?.name || 'Unknown'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* History & Exam */}
                        <div className="space-y-3">
                            <div>
                                <span className="block text-xs font-bold uppercase text-blue-700 mb-1">
                                    <FontAwesomeIcon icon={faNotesMedical} className="mr-1" /> History (HPI)
                                </span>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-2 rounded border border-blue-100">
                                    {opdData.history?.history_presenting_illness || 'Not recorded'}
                                </p>
                            </div>
                            
                            <div>
                                <span className="block text-xs font-bold uppercase text-blue-700 mb-1">Examination</span>
                                <div className="text-sm text-gray-700 bg-white p-2 rounded border border-blue-100 space-y-1">
                                    <p><strong>General:</strong> {opdData.examination?.general_condition || '-'}</p>
                                    <p><strong>GCS:</strong> {opdData.examination?.glasgow_coma_score || '-'}</p>
                                    {opdData.examination?.pallor === 1 && <span className="text-xs bg-red-100 text-red-800 px-1 rounded mr-1">Pallor</span>}
                                    {opdData.examination?.jaundice === 1 && <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Jaundice</span>}
                                </div>
                            </div>
                        </div>

                        {/* Diagnosis & Orders */}
                        <div className="space-y-3">
                            <div>
                                <span className="block text-xs font-bold uppercase text-blue-700 mb-1">
                                    <FontAwesomeIcon icon={faStethoscope} className="mr-1" /> Diagnosis
                                </span>
                                <ul className="list-disc list-inside text-sm bg-white p-2 rounded border border-blue-100">
                                    {opdData.diagnoses_confirmed?.map((d,i) => <li key={'c'+i} className="font-bold">{d.diagnosis_name || d.diagnosis?.name} (Conf)</li>)}
                                    {opdData.diagnoses_provisional?.map((d,i) => <li key={'p'+i}>{d.diagnosis_name || d.diagnosis?.name} (Prov)</li>)}
                                    {(!opdData.diagnoses_confirmed?.length && !opdData.diagnoses_provisional?.length) && <li className="italic text-gray-400">None</li>}
                                </ul>
                            </div>

                            {(opdData.prescriptions?.length > 0 || opdData.lab_requests?.length > 0 || opdData.radiology_requests?.length > 0) && (
                                <div>
                                    <span className="block text-xs font-bold uppercase text-blue-700 mb-1">
                                        Initial Orders
                                    </span>
                                    <div className="bg-white p-2 rounded border border-blue-100 text-xs space-y-2">
                                        {/* Pharmacy */}
                                        {opdData.prescriptions?.length > 0 && (
                                            <div>
                                                <strong className="text-gray-500"><FontAwesomeIcon icon={faPills}/> Rx:</strong>
                                                <ul className="pl-4 list-none">
                                                    {opdData.prescriptions.map((p,i) => (
                                                        <li key={i}>{p.product?.name} ({p.dosage} x {p.frequency})</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {/* Lab */}
                                        {opdData.lab_requests?.length > 0 && (
                                            <div>
                                                <strong className="text-gray-500"><FontAwesomeIcon icon={faFlask}/> Lab:</strong>
                                                <span className="ml-1">{opdData.lab_requests.map(l => l.panel?.name).join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}